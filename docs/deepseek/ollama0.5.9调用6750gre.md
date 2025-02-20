# ollama0.5.9调用6750gre

1. 下载专属版本ollama，下载地址:

[Releases · likelovewant/ollama-for-amd](https://github.com/likelovewant/ollama-for-amd/releases/download/v0.5.9/OllamaSetup.exe "Releases · likelovewant/ollama-for-amd")

当前最新版本下载0.5.9

1. 安装ollama，一路下一步
2. 下载 ollama-windows-amd64，并解压ollama.exe和lib这两个文件/夹

[ollama-windows-amd64.7z](https://github.com/likelovewant/ollama-for-amd/releases/download/v0.5.9/ollama-windows-amd64.7z "ollama-windows-amd64.7z")

1. 打开ollama安装目录,替换上面解压的文件，安装目录是

`C:\Users\用户名\AppData\Local\Programs\Ollama`

1. 下载ROCm

下载地址：

[Release v0.6.1.2 · likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU · GitHub](https://github.com/likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU/releases/tag/v0.6.1.2 "Release v0.6.1.2 · likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU · GitHub")

1. 解压出来，rocblas.dll和library目录，替换到对应的目录下，目录地址：

- libarary替换地址：`C:\Users\用户名\AppData\Local\Programs\Ollama\lib\ollama\rocm\rocblas\library`
- rocblas.dll替换：`C:\Users\用户名\AppData\Local\Programs\Ollama\lib\ollama\rocm\rocblas.dll`

1. 重启ollama查看启动日志，是否有显卡型号信息如：` level=INFO source=types.go:130 msg="inference compute" id=0 library=rocm variant="" compute=gfx1031 driver=6.1 name="AMD Radeon RX 6750 GRE 12GB" total="12.0 GiB" available="11.8 GiB"`
