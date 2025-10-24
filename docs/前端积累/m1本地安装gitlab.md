# m1本地装gitlab


###  使用 Docker 快速搭建
Docker 方式无需复杂的环境配置，通过容器快速启动 GitLab，适合本地开发或临时测试。

#### 前提条件：
- 安装 [Docker](https://docs.docker.com/get-docker/) 和 [Docker Compose](https://docs.docker.com/compose/install/)（Docker  Desktop 已内置）。
- 本地磁盘至少 4GB 空闲空间，内存建议 4GB 以上（GitLab 资源消耗较高）。


#### 步骤 1：创建配置文件
1. 新建一个目录（如 `gitlab-local`），用于存放 GitLab 数据和配置：
   ```bash
   mkdir -p ~/gitlab-local/{config,logs,data}
   cd ~/gitlab-local
   ```
   上面会创建gitlab-local文件夹，同时创建配置、日志、数据 3个文件夹。

2. 在当前目录创建 `docker-compose.yml` 文件，内容如下：
- 注意 ：需要指定拉取arm64 的镜像，官方支持arm版本的镜像。docker-hub上也能搜到其他的arm版本的镜像。
- 端口： 容器默认http端口是80，ssh端口默认22，需要将本地端口映射到容器的80端口。

   ```yaml
   version: '3.8'
   services:
     gitlab:
       image: gitlab/gitlab-ce:latest  # 社区版（免费）
       container_name: gitlab-local
       restart: always
       platform: linux/arm64  # 指定架构为 ARM64（适配 M1/M2 芯片） ！！！！重要
       hostname: 'localhost'  # 本地访问域名（可改为自定义域名，如 
       ports:
         - '9080:80'  # HTTP 端口映射（本地端口:容器端口）
         - '443:443'    # HTTPS 端口（可选，需配置证书）
         - '9022:22'    # SSH 端口映射
       volumes:
         - ./config:/etc/gitlab    # 配置文件目录
         - ./logs:/var/log/gitlab  # 日志目录
         - ./data:/var/opt/gitlab  # 数据存储目录
   ```
   - 端口说明：`9080` 用于 HTTP 访问，`9022` 用于 Git SSH 操作（避免与本地 SSH 服务冲突）。


#### 步骤 2：启动 GitLab 容器
在 `gitlab-local` 目录下执行，效果就是启动容器：
```bash
docker-compose up -d
```
- 首次启动需要拉取镜像（约 1.78G）并初始化，耗时 5-10 分钟（取决于网络和硬件）。
- 查看启动日志（可选）：
  ```bash
  docker logs -f gitlab-local
  ```
  当日志显示 `gitlab Reconfigured!` 时，说明初始化完成。


#### 步骤 3：访问并配置 GitLab
1. 打开浏览器，访问 `http://localhost:9080`（首次加载较慢）。
  - 看到登录界面证明启动成功

2. 获取初始管理员密码：
  - 方法1：进入容器中再执行cat 命令查看：
    ```bash
    docker exec -it gitlab-local bash
    cat /etc/gitlab/initial_root_password
    ```
   - 方法2：直接执行以下命令查看默认密码（用户名：`root`）：
     ```bash
     docker exec -it gitlab-local grep 'Password:' /etc/gitlab/initial_root_password
     ```
   - 提示：密码文件 24 小时后自动删除，建议登录后立即修改。



#### 其他：停止/重启 GitLab
- 停止：`docker-compose down`
- 重启：`docker-compose restart`
- 数据会保存在 `config`、`logs`、`data` 目录，删除容器后重新启动可恢复。

**注意：**
  - 默认用户名：`root`
  - 新用户注册，需要root管理员登录之后审批才可以使用
  - 镜像拉取要指定使用arm64架构的镜像，因为m1是arm64架构的



。







