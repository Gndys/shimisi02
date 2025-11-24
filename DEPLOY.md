# 🚀 快速部署指南

## 方法一：GitHub + Cloudflare Pages（推荐）

### 1. 上传到 GitHub

```bash
cd cloudflare-table5-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/table5-app.git
git push -u origin main
```

### 2. 部署到 Cloudflare Pages

1. 登录 https://dash.cloudflare.com/
2. 进入 Workers & Pages → Create application → Pages → Connect to Git
3. 选择你的 GitHub 仓库
4. 配置：
   - Project name: table5-app
   - Build command: 留空
   - Build output directory: /
5. 点击 Save and Deploy

### 3. 完成

部署完成后会获得一个 `*.pages.dev` 域名，可以立即访问！

## 方法二：本地测试

```bash
cd cloudflare-table5-app
python3 -m http.server 8000
```

访问 http://localhost:8000
