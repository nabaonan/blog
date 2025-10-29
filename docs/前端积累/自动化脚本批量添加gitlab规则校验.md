
# 脚本解析文档

## 脚本名称
`add_gitlab_hook.sh`

## 主要功能
该脚本用于为指定的 GitLab 仓库批量添加提交规则（pre-receive 钩子），规范分支和标签命名，防止不符合规范的分支/tag被推送到远程仓库。

## 使用流程
1. **输入仓库名**  
   用户输入需要添加规则的仓库名（支持多个，空格分隔）。

2. **查找 git-data 目录**  
   自动递归查找当前目录及子目录下的 `git-data` 目录，若未找到则提示用户手动输入路径。

3. **路径规范化与校验**  
   使用 `realpath` 规范化路径，并检查目录是否存在，若无效则退出。

4. **查找 GitLab 容器并执行 SQL 查询**  
   自动检测正在运行的 GitLab Docker 容器，通过 `gitlab-psql` 查询项目的 hash（用于定位仓库路径）。

5. **计算仓库路径**  
   根据 hash 计算仓库在 `git-data/repositories/@hashed` 下的实际路径。

6. **创建 custom_hooks 目录及 pre-receive 钩子**  
   在仓库的 `custom_hooks` 目录下创建 `pre-receive` 钩子脚本，脚本内容包括分支和标签命名规范校验。

7. **分支命名规范**  
   - 允许主分支：`develop`
   - 功能/修复分支格式：`feature/v主版本.次版本.修订号/描述`、`bugfix/v主版本.次版本.修订号/描述`、`hotfix/v主版本.次版本.修订号/描述`
   - 描述仅允许小写字母、数字、下划线、短横线

8. **标签命名规范**  
   - 必须以 `v` 开头，后跟 3 或 4 个数字段（如 `v1.0.0`、`v2.3.0.1`）
   - 禁止修改已有标签，仅允许新建或删除

9. **执行结果**  
   每个仓库处理完成后会提示，全部处理完成后脚本结束。

## 注意事项
- 需有 GitLab 数据库访问权限（本地或 Docker 容器）。
- 钩子脚本会覆盖原有 `custom_hooks/pre-receive` 文件。
- 仅支持 GitLab 13.x 及以上版本的 hashed 仓库结构。

## 示例命令
```bash
bash add_gitlab_hook.sh
```
根据提示输入仓库名和 `git-data` 路径即可自动完成规则添加。


脚本完整代码如下：
```bash

#!/bin/bash

# 读取仓库名
read -p "请输入要添加规则的仓库名（空格分隔）: " repo_names
repos=($repo_names)


# 检测 git-data 目录
find_git_data() {
  # 递归查找当前目录及所有子目录
  local found=$(find "$(pwd)" -type d -name "git-data" -print -quit)
  if [ -n "$found" ]; then
    # echo "检测到 git-data 目录：$found"
    echo "$found"
    return
  fi
  echo "未找到 git-data 目录，请手动输入：" >&2
  read -p "请输入 git-data 目录路径: " manual_dir
  echo "$manual_dir"
}


# 检测 git-data 目录
git_data_dir=$(find_git_data)
git_data_dir=$(echo "$git_data_dir" | tr -d '\r\n')
echo "最终使用的 git-data 目录：$git_data_dir"

# 优化目录检查逻辑，解决路径中包含空格或特殊字符的问题
if [ -z "$git_data_dir" ]; then
  echo "git-data 目录路径为空，脚本退出。" >&2
  exit 1
fi

# 规范化路径并检查目录是否存在
git_data_dir_normalized=$(realpath "$git_data_dir" 2>/dev/null || echo "$git_data_dir")
if [ ! -d "$git_data_dir_normalized" ]; then
  echo "git-data 目录无效，脚本退出。" >&2
  echo "尝试使用的路径: $git_data_dir" >&2
  echo "规范化后的路径: $git_data_dir_normalized" >&2
  exit 1
fi

# 更新变量为规范化后的路径
git_data_dir="$git_data_dir_normalized"
echo "使用规范化路径: $git_data_dir"

# 定义在适当环境执行 gitlab-psql 的函数
execute_psql() {
  # 查找镜像名包含 gitlab 的正在运行的容器
  container_id=$(docker ps --filter "ancestor=gitlab/gitlab-ce" --filter "ancestor=gitlab/gitlab-ee" --format "{{.Names}}" | head -n 1)
  container_id=$(echo "$container_id" | tr -d '\r\n')
  echo "第一次查找的容器: $container_id"
  if [ -z "$container_id" ]; then
    # 如果没有找到，尝试用模糊匹配
    container_id=$(docker ps --format "{{.Names}} {{.Image}}" | grep 'gitlab' | awk '{print $1}' | head -n 1)
    container_id=$(echo "$container_id" | tr -d '\r\n')
    echo "模糊匹配到的容器: $container_id"
  fi

  if [ -n "$container_id" ]; then
    echo "正在进入 Docker 容器 $container_id ..."
    docker exec -it "$container_id" gitlab-psql "$@"
  else
    echo "请确保已安装 gitlab-psql 并有权限访问数据库。"
    gitlab-psql "$@"
  fi
}

# 进入 gitlab-psql

for repo in "${repos[@]}"; do
  # 查询 hash，分步执行
  sql="SELECT encode(sha256((id::text)::bytea), 'hex') FROM projects WHERE name = '$repo';"
  result=$(execute_psql -c "$sql")
  echo "SQL 查询结果：$result"
  hash=$(echo "$result" | awk '/^[[:space:]]*[0-9a-f]{64}[[:space:]]*$/ {gsub(/^[[:space:]]+|[[:space:]]+$/, "", $0); print $0}')
  echo "仓库 $repo 的 hash 为：$hash"
  if [ -z "$hash" ]; then
    echo "仓库 $repo 未找到 hash，跳过。" >&2
    continue
  fi

  # 计算路径
  d1=${hash:0:2}
  d2=${hash:2:2}
  repo_path="$git_data_dir/repositories/@hashed/$d1/$d2/$hash.git"
  hooks_path="$repo_path/hooks"
  custom_hooks_path="$repo_path/custom_hooks"

  # 检查并创建 custom_hooks
  if [ ! -d "$custom_hooks_path" ]; then
    mkdir -p "$custom_hooks_path"
  fi

  # 创建 pre-receive 文件
  pre_receive="$custom_hooks_path/pre-receive"
  cat > "$pre_receive" <<'EOF'
#!/bin/bash
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8

VALID_BRANCH_REGEX="^(feature|bugfix|hotfix)/v[0-9]+\.[0-9]+\.[0-9]+/[a-z0-9_-]+$|^develop$"
BRANCH_ERROR_MSG="错误：分支「%s」命名不符合规则！\n允许格式：\n1. 主分支：develop\n2. 功能/修复分支：\n   - feature/v主版本.次版本.修订号/描述（如 feature/v1.2.0/login）\n   - bugfix/v0.3.5/pay-error）\n   - hotfix/v2.1.0/crash-fix）\n说明：\n- 版本号必须为3个数字段（如v1.0.0）\n- 描述仅允许小写字母、数字、下划线(_)、短横线(-)"

VALID_TAG_REGEX="^v[0-9]+\.[0-9]+\.[0-9]+(\.[0-9]+)?$"
TAG_ERROR_MSG="错误：标签「%s」命名不符合规则！\n要求格式：v主版本.次版本.修订号（如 v1.0.1、v2.3.0，v1.0.0.0）\n说明：必须以v开头，后跟3或4个数字段（用点分隔）"

while read oldrev newrev refname; do
  if [[ "$refname" == refs/heads/* ]]; then
    branch_name=$(echo "$refname" | sed 's/refs\/heads\///')
    if [[ "$oldrev" == 0000000000000000000000000000000000000000 ]]; then
      if ! [[ "$branch_name" =~ $VALID_BRANCH_REGEX ]]; then
        printf "$BRANCH_ERROR_MSG\n" "$branch_name" >&2
        exit 1
      fi
    fi
  elif [[ "$refname" == refs/tags/* ]]; then
    tag_name=$(echo "$refname" | sed 's/refs\/tags\///')
    if [[ "$oldrev" == 0000000000000000000000000000000000000000 ]]; then
      # 新建 tag，校验命名
      if ! [[ "$tag_name" =~ $VALID_TAG_REGEX ]]; then
        printf "$TAG_ERROR_MSG\n" "$tag_name" >&2
        exit 1
      fi
    elif [[ "$newrev" == 0000000000000000000000000000000000000000 ]]; then
      # 删除 tag，允许
      continue
    else
      # 修改 tag，禁止
      echo "错误：不允许修改已有标签「$tag_name」！" >&2
      exit 1
    fi
  fi

done

exit 0
EOF

  chmod +x "$pre_receive"
  echo "已为仓库 $repo 添加提交规则。"
done

echo "全部处理完成。"
```