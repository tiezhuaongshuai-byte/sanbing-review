# 三冰复盘系统 · 部署说明

## 方式一：Vercel 部署（推荐，免费，10分钟）

### 第一步：注册账号
1. 打开 https://github.com 注册一个账号（有的话跳过）
2. 打开 https://vercel.com 用 GitHub 账号登录

### 第二步：上传代码
1. 打开 https://github.com/new 新建仓库
2. 仓库名随便填，如：sanbing-review
3. 创建完成后，点「uploading an existing file」
4. 把整个 sanbing-app 文件夹里的所有文件拖进去上传
5. 点「Commit changes」保存

### 第三步：一键部署
1. 回到 https://vercel.com/dashboard
2. 点「Add New Project」→ 选择刚才的仓库
3. 框架自动识别为 Vite，直接点「Deploy」
4. 等待 1-2 分钟，部署完成后得到一个网址，如：https://sanbing-review.vercel.app

### 第四步：发给运营使用
把这个网址发给宋帅和付百坤，手机电脑都能打开，直接使用。

---

## 方式二：本机运行（局域网内多人用）

### 前提：需要安装 Node.js
下载地址：https://nodejs.org（下载 LTS 版本）

### 步骤：
```bash
# 1. 进入项目目录
cd sanbing-app

# 2. 安装依赖（只需第一次）
npm install

# 3. 启动（开发模式）
npm run dev

# 4. 浏览器打开 http://localhost:5173 即可使用
```

### 局域网访问：
修改 vite.config.js，添加 host 配置：
```js
export default defineConfig({
  plugins: [react()],
  server: { host: true }
})
```
启动后会显示局域网地址，如 http://192.168.1.100:5173
同一 WiFi 下的手机和电脑都能访问这个地址。

---

## ⚠️ 关于数据存储

当前版本数据存在**浏览器本地（localStorage）**。

- 同一台电脑同一个浏览器：数据共享 ✅
- 不同电脑/手机：数据不共享 ❌

**真正多人共享数据**需要后端数据库，这需要额外开发。
如果只是一个运营用一台电脑，当前版本完全够用。
如果需要多人实时共享，建议使用飞书多维表格方案。

---

## 文件结构说明
```
sanbing-app/
├── index.html          # 入口文件
├── package.json        # 项目配置
├── vite.config.js      # 构建配置
└── src/
    ├── main.jsx        # React 入口
    └── App.jsx         # 主应用（所有功能都在这里）
```
