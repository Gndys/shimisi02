# 📊 表5工资表自动生成系统 - Cloudflare 版

纯前端实现的工资表自动生成系统，可部署到 Cloudflare Pages，无需服务器，所有数据处理在浏览器本地完成。

## ✨ 特性

- 🚀 **纯前端实现** - 使用 HTML + CSS + JavaScript，无需后端服务器
- 🔒 **数据安全** - 所有数据处理在浏览器本地完成，不上传到服务器
- 📦 **ZIP 文件处理** - 自动解压并识别附表文件
- 📊 **Excel 处理** - 使用 SheetJS 库读取和生成 Excel 文件
- 🎨 **现代化界面** - 响应式设计，支持桌面和移动设备
- ⚡ **快速部署** - 一键部署到 Cloudflare Pages
- 🆓 **完全免费** - 使用 Cloudflare Pages 免费托管

## 🛠️ 技术栈

- **前端框架**: 纯 HTML5 + CSS3 + ES6 JavaScript
- **Excel 处理**: [SheetJS (xlsx)](https://sheetjs.com/) v0.20.1
- **ZIP 处理**: [JSZip](https://stuk.github.io/jszip/) v3.10.1
- **托管平台**: Cloudflare Pages

## 📁 项目结构

```
cloudflare-table5-app/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── app.js             # 核心逻辑
├── _headers           # Cloudflare Pages 响应头配置
├── _redirects         # Cloudflare Pages 重定向配置
├── .gitignore         # Git 忽略文件
└── README.md          # 项目文档
```

## 🚀 部署到 Cloudflare Pages

### 方法一：通过 GitHub 自动部署（推荐）

1. **创建 GitHub 仓库**
   ```bash
   cd cloudflare-table5-app
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/table5-app.git
   git push -u origin main
   ```

2. **连接到 Cloudflare Pages**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 **Pages** 页面
   - 点击 **创建项目** → **连接到 Git**
   - 选择你的 GitHub 仓库
   - 配置构建设置：
     - **项目名称**: `table5-app`（或自定义）
     - **生产分支**: `main`
     - **构建命令**: 留空（纯静态网站）
     - **构建输出目录**: `/`
   - 点击 **保存并部署**

3. **等待部署完成**
   - Cloudflare 会自动构建和部署
   - 部署完成后会获得一个 `*.pages.dev` 域名
   - 每次推送到 GitHub 都会自动重新部署

### 方法二：通过 Wrangler CLI 部署

1. **安装 Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **部署项目**
   ```bash
   cd cloudflare-table5-app
   wrangler pages deploy . --project-name=table5-app
   ```

### 方法三：直接上传

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** → **创建项目** → **直接上传**
3. 将所有文件打包成 ZIP（不包括 .git 目录）
4. 上传 ZIP 文件
5. 等待部署完成

## 💻 本地开发

### 方法一：使用 Python 简单服务器

```bash
cd cloudflare-table5-app
python3 -m http.server 8000
```

然后访问 `http://localhost:8000`

### 方法二：使用 Node.js 服务器

```bash
# 安装 http-server
npm install -g http-server

# 启动服务器
cd cloudflare-table5-app
http-server -p 8000
```

### 方法三：使用 VS Code Live Server

1. 安装 VS Code 扩展 "Live Server"
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

## 📋 使用说明

1. **准备附表文件**
   - 将所有附表文件放在名为 `附表` 的文件夹中
   - 支持的附表：附9-附11, 附14-附19, 附25-附26
   - 将 `附表` 文件夹压缩成 ZIP 文件

2. **上传处理**
   - 访问部署后的网站
   - 点击上传区域或拖拽 ZIP 文件
   - 点击"开始处理"按钮
   - 等待处理完成

3. **下载结果**
   - 查看数据预览
   - 点击"下载工资表"按钮
   - 获得生成的 Excel 文件

## 📊 支持的附表文件

| 附表编号 | 文件名示例 | 说明 |
|---------|-----------|------|
| 附9 | 附9 安装维修工单_2025.09月.xlsx | 安装维修工单（必需） |
| 附10 | 附10 销售出库单.xlsx | 销售出库单（必需） |
| 附11 | 附11 收款单.xlsx | 收款单（必需） |
| 附14 | 附14 安装结算初审单.xls | 安装结算初审单 |
| 附15 | 附15 维修结算初审单.xls | 维修结算初审单 |
| 附16 | 附16 多项费用申请单 增项.xls | 增项 |
| 附17 | 附17 多项费用申请单 减项.xls | 减项 |
| 附18 | 附18 促销活动结算初审单.xls | 促销活动结算 |
| 附19 | 附19 星级人员评定报表.xls | 星级人员评定 |
| 附25 | 附25 温州 材料费报表.xlsx | 材料费报表 |
| 附26 | 附26 2025年 中瑞一线师傅结算提成标准.xls | 提成标准 |

## 🔧 自定义业务逻辑

如果需要修改工资计算逻辑，请编辑 `app.js` 文件中的以下函数：

```javascript
// 生成工资表的主函数
async function generateTable5(data) {
    // 在这里添加你的业务逻辑
}

// 计算提成的函数
function calculateCommission(row, salesData, paymentData) {
    // 在这里添加提成计算逻辑
}
```

## 🌐 自定义域名

在 Cloudflare Pages 设置中可以添加自定义域名：

1. 进入项目设置
2. 点击 **自定义域**
3. 添加你的域名
4. 按照提示配置 DNS

## 🔒 安全性

- ✅ 所有数据处理在浏览器本地完成
- ✅ 不会上传任何数据到服务器
- ✅ 使用 HTTPS 加密传输
- ✅ 设置了安全响应头（X-Frame-Options, CSP 等）
- ✅ 开源代码，可审计

## 📝 注意事项

1. **浏览器兼容性**
   - 推荐使用现代浏览器（Chrome, Firefox, Safari, Edge）
   - 需要支持 ES6+ 和 File API

2. **文件大小限制**
   - 浏览器内存限制，建议 ZIP 文件不超过 100MB
   - 如果文件过大可能导致浏览器卡顿

3. **数据隐私**
   - 所有处理在本地完成，不会上传数据
   - 关闭页面后数据会被清除

## 🐛 故障排除

### 问题：上传后没有反应
- 检查浏览器控制台是否有错误
- 确认 ZIP 文件中包含 `附表` 文件夹
- 确认附表文件名格式正确

### 问题：处理失败
- 检查附表文件是否完整
- 确认 Excel 文件格式正确（.xlsx 或 .xls）
- 查看日志区域的错误信息

### 问题：下载的文件打不开
- 确认使用的是现代浏览器
- 尝试使用不同的浏览器
- 检查是否有浏览器扩展干扰

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请通过以下方式联系：

- 提交 GitHub Issue
- 发送邮件到项目维护者

---

**享受自动化工资表生成的便利！** 🎉
