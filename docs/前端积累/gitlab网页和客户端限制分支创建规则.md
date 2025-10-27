# 限制分支创建规则


1. 进入到仓库的目录，没有hooks目录，创建一个
`/Users/<用户名>/gitlab-arm/data/git-data/repositories/@hashed/6b/86/<hash值>.git/hooks`

2. 添加githooks脚本,放到hooks目录下
添加 pre-receive  不要加后缀

3 添加可运行权限，
`chmod +x pre-receive`

gitlab在推送的时候自动执行这个脚本

4. 添加脚本内容如下
```bash
#!/bin/bash
# 确保中文正常显示
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8

# --------------------------
# 分支命名规则正则
# --------------------------
# 允许：develop 或 (feature/bugfix/hotfix)/vx.y.z/描述
VALID_BRANCH_REGEX="^(feature|bugfix|hotfix)/v[0-9]+\.[0-9]+\.[0-9]+/[a-z0-9_-]+$|^develop$"
BRANCH_ERROR_MSG="错误：分支「%s」命名不符合规则！\n允许格式：\n1. 主分支：develop\n2. 功能/修复分支：\n   - feature/v主版本.次版本.修订号/描述（如 feature/v1.2.0/login）\n   - bugfix/v主版本.次版本.修订号/描述（如 bugfix/v0.3.5/pay-error）\n   - hotfix/v主版本.次版本.修订号/描述（如 hotfix/v2.1.0/crash-fix）\n说明：\n- 版本号必须为3个数字段（如v1.0.0）\n- 描述仅允许小写字母、数字、下划线(_)、短横线(-)"

# --------------------------
# 标签命名规则正则
# --------------------------
# 允许：v+3个数字段（如v1.0.1）或者4位
VALID_TAG_REGEX="^v[0-9]+\.[0-9]+\.[0-9]+(\.[0-9]+)?$"
TAG_ERROR_MSG="错误：标签「%s」命名不符合规则！\n要求格式：v主版本.次版本.修订号（如 v1.0.1、v2.3.0，v1.0.0.0）\n说明：必须以v开头，后跟3或4个数字段（用点分隔）"

while read oldrev newrev refname; do
  # --------------------------
  # 处理分支（refs/heads/开头）
  # --------------------------
  if [[ "$refname" == refs/heads/* ]]; then
    branch_name=$(echo "$refname" | sed 's/refs\/heads\///')
    
    # 校验新分支（oldrev为全0表示新分支）
    if [[ "$oldrev" == 0000000000000000000000000000000000000000 ]]; then
      if ! [[ "$branch_name" =~ $VALID_BRANCH_REGEX ]]; then
        # 替换错误信息中的占位符为实际分支名
        printf "$BRANCH_ERROR_MSG\n" "$branch_name" >&2
        exit 1  # 拒绝推送
      fi
    fi

  # --------------------------
  # 处理标签（refs/tags/开头）
  # --------------------------
  elif [[ "$refname" == refs/tags/* ]]; then
    tag_name=$(echo "$refname" | sed 's/refs\/tags\///')
    
    # 校验新标签（oldrev为全0表示新标签）
    if [[ "$oldrev" == 0000000000000000000000000000000000000000 ]]; then
      if ! [[ "$tag_name" =~ $VALID_TAG_REGEX ]]; then
        # 替换错误信息中的占位符为实际标签名
        printf "$TAG_ERROR_MSG\n" "$tag_name" >&2
        exit 1  # 拒绝推送
      fi
    else
      # 禁止修改已有标签（可选，根据需求调整）
      echo "错误：不允许修改或删除已有标签「$tag_name」！" >&2
      exit 1
    fi
  fi
done

exit 0  # 校验通过，允许推送
```



5. 如何根据hash值查看仓库名

`/Users/<用户名>/gitlab-arm/data/git-data/repositories/@hashed/6b/86/<hash值>.git`
进入上面这个目录，记录下来hash值
进入容器终端，通过命令 `docker exec -it gitlab-arm bash`


通过postSQL查看仓库名
写sql  `SELECT id, name, path FROM projects WHERE encode(sha256((id::text)::bytea), 'hex') ='6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b';`

返回的结果如下
```
 id |     name     |     path     
----+--------------+--------------
  1 | test-githook | test-githook
(1 row)
```

6. 根据仓库名反查 hash值
首先输入`gitlab-psql`进入postgresql数据库   
其次输入下面的sql，其主要原理是将id转换成sha256，实际上项目的hash值就是id的sha256值，id基本就是数字1,2,3
`SELECT encode(sha256((id::text)::bytea), 'hex') FROM projects WHERE name = '<仓库名称>';`