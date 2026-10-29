#!/usr/bin/env bash
# 在服务器上以 root 执行：拉取 main 分支最新代码、构建并重启服务
set -euo pipefail

APP_DIR=/opt/jigoku-tsushin

cd "$APP_DIR"
git fetch --depth 1 origin main
git reset --hard origin/main
pnpm install --frozen-lockfile
pnpm build
systemctl restart jigoku-tsushin
systemctl --no-pager --lines=5 status jigoku-tsushin
