# 说明

笔记本是 m1 的 air，需要在 arm 芯片上跑 cas 开源项目 ，由于项目用的版本比较老，用的 maven3.3.9 ，所以需要安装 jdk8
但是查了一下似乎 jdk8 不支持 arm 芯片 ，后来只能用了第三方的更改版本

## 在 arm 芯片电脑上安装 jdk8

访问网站
https://www.azul.com/downloads/?package=jdk#zulu

这里找到 这里可以找到 jdk 8u462b08 版本
![alt text](image.png)

## 安装 idea

官网下载的 2025.2.1 版本，显示可以试用 1 个月，

## 安装 tomcat

安装的 tomcat9

下载地址：https://archive.apache.org/dist/tomcat/tomcat-9/v9.0.99/bin/
直接下载的 zip 版本

## 安装 maven 依赖

在 idea 右侧点击 install

## 本地启动项目

说明： package 是将当前项目进行打包，cas 项目会打包为 war 文件，直接放到 tomcat 中，重启 tomcat 就可以直接访问

## 定制修改登录页面

参考：https://blog.csdn.net/Anumbrella/article/details/82728641
