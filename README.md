# 新能源一体化协同调控平台

基于 Vue 3 + TypeScript + Vite 还原的新能源一体化协同调控平台前端项目。

## 技术栈

- **Vue 3.4** + Composition API + `<script setup>`
- **TypeScript 5**
- **Vite 5**
- **Element Plus 2** - UI 组件库
- **Pinia 2** - 状态管理
- **Vue Router 4** - 路由管理
- **ECharts 5** + vue-echarts - 数据可视化
- **Tailwind CSS 3** - 原子化 CSS
- **lucide-vue-next** - 图标库

## 项目结构

```
energy-platform/
├── public/images/              # 原型图片资源（704个文件）
├── src/
│   ├── assets/
│   │   └── index.css           # 全局样式 + Tailwind
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.vue   # 业务布局容器
│   │   │   ├── AppHeader.vue   # 顶部导航栏
│   │   │   └── AppSidebar.vue  # 侧边栏导航
│   │   └── common/
│   │       └── CardPanel.vue   # 渐变卡片组件
│   ├── views/
│   │   ├── Login.vue           # 登录页
│   │   ├── energy-storage/     # 储能模块（8个页面）
│   │   ├── solar/              # 光伏模块（4个页面）
│   │   ├── ChargingStation.vue # 充电桩
│   │   ├── CommercialLoad.vue  # 工商业负荷
│   │   ├── AlarmCenter.vue     # 告警中心
│   │   └── LoginLog.vue        # 登录日志
│   ├── router/
│   │   └── index.ts            # 路由配置
│   ├── stores/
│   │   └── user.ts             # 用户状态管理
│   ├── App.vue
│   └── main.ts
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 核心页面

| 页面 | 状态 | 说明 |
|------|------|------|
| **登录页** | 完整 | 背景图 + 登录卡片 + 表单校验 |
| **储能-可视看板** | 完整 | 设备信息、收益曲线图、充放电分析、告警统计 |
| **储能-实时监控** | 完整 | 拓扑图、能量组监控、能量块监控、实时参数表格 |
| **其他页面** | 占位 | 已创建基础框架和导航，可后续扩展 |

## 启动项目

由于系统 PowerShell 执行策略限制，请使用以下方式之一运行：

### 方式一：使用 CMD（推荐）

```cmd
cd /d "c:\Users\vcmy\Desktop\新能源一体化协同调控平台-260407v1.4\energy-platform"
npm run dev
```

### 方式二：使用 Node 直接运行 npm

```powershell
cd "c:\Users\vcmy\Desktop\新能源一体化协同调控平台-260407v1.4\energy-platform"
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
```

### 方式三：修改 PowerShell 执行策略

以管理员身份运行 PowerShell：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

然后正常执行：

```powershell
cd "c:\Users\vcmy\Desktop\新能源一体化协同调控平台-260407v1.4\energy-platform"
npm run dev
```

## 默认账号

- **账号**: `admin`
- **密码**: `admin123`

## 构建部署

```bash
npm run build
```

构建产物位于 `dist/` 目录。
