#!/bin/bash

echo "开始部署 campus-front..."

# 停止并删除旧容器
docker-compose down

# 构建镜像
docker-compose build --no-cache

# 启动容器
docker-compose up -d

echo "部署完成！访问地址: http://localhost:9090"
