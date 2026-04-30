# 新能源一体化协同调控平台

## 项目概述

本项目是一个**新能源一体化协同调控平台**的前端实现，包含两个独立部分：

1. **Axure 原型文件**（项目根目录）：由 Axure RP 11 生成的静态 HTML 原型，包含完整的页面结构、插件系统和静态资源，用于 UI 设计和需求确认。
2. **Vue 3 应用**（`energy-platform/` 目录）：基于原型还原的现代化前端应用，采用 Vue 3 + TypeScript + Vite 技术栈，实现了可交互的生产级界面。

实际开发和迭代工作在 `energy-platform/` 目录下进行。根目录下的 HTML 文件及 `resources/`、`plugins/`、`images/`、`files/` 等目录为 Axure 原型输出物，**不应直接修改**。

## 技术栈

- **Vue 3.4.21** + Composition API + `<script setup>` 语法
- **TypeScript 5.4.2**
- **Vite 5.1.6** —— 构建工具与开发服务器
- **Element Plus 2.6.1** —— UI 组件库
- **Pinia 2.1.7** —— 状态管理
- **Vue Router 4.3.0** —— 路由管理
- **ECharts 5.5.0** + `vue-echarts` 6.6.9 —— 数据可视化图表
- **Tailwind CSS 3.4.17** + `tailwindcss-animate` + `tailwind-merge` —— 原子化 CSS
- **lucide-vue-next** 0.344.0 —— 图标库
- **FontAwesome** 6.5.1 —— 品牌图标（仅 `@fortawesome/free-brands-svg-icons`）
- **Three.js** 0.184.0 —— 3D 渲染（已引入，依赖中保留）
- **axios** 1.6.8 —— HTTP 客户端

> 注意：项目中**不存在 ESLint、Prettier、Vitest、Jest、Cypress、Playwright** 等配置或依赖。

## 项目结构

```
energy-platform/            # Vue 3 实际应用（工作目录）
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
    ├── postcss.config.js
    ├── index.html
    ├── gen_form_dialog.py      # Python 辅助脚本：批量生成 Vue 表单弹窗
    ├── patch_strategy.py       # Python 辅助脚本：修补策略页面代码
    ├── public/
    │   └── images/             # 静态图片资源，按页面模块分目录存放
    │       ├── 储能-可视看板/
    │       ├── 储能-实时监控/
    │       ├── 登录/
    │       └── ...
    ├── src/
    │   ├── main.ts             # 应用入口（注册 Pinia、Router、ElementPlus、FontAwesome）
    │   ├── App.vue             # 根组件（仅包含 <router-view />）
    │   ├── assets/
    │   │   └── index.css       # Tailwind 指令 + 全局样式 + CSS 变量 + 滚动条定制
    │   ├── api/
    │   │   └── api.js          # axios 统一实例 + 请求/响应拦截器 + 各业务模块 API
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── AppLayout.vue    # 业务布局容器（背景图 + Sidebar + Header）
    │   │   │   ├── AppHeader.vue    # 顶部导航栏（标题、实时时钟、用户信息下拉）
    │   │   │   └── AppSidebar.vue   # 左侧边栏导航（6 个主菜单，可折叠 64px/140px）
    │   │   ├── common/
    │   │   │   ├── CardPanel.vue      # 渐变卡片容器组件
    │   │   │   ├── ModuleTabs.vue     # 通用模块子导航标签栏（替代原 EnergyStorageTabs / SolarTabs）
    │   │   │   └── LifecycleManager.vue  # 设备全生命周期管理（7 阶段时间轴）
    │   │   └── business/            # 业务通用组件（跨页面复用）
    │   │       ├── WorkOrderManager.vue  # 工单管理器（运维管理页面复用）
    │   │       ├── CalendarPicker.vue    # 日历日期选择器（策略表单弹窗复用）
    │   │       ├── ModalDialog.vue       # 通用弹窗容器
    │   │       └── PanelCard.vue         # 渐变面板卡片容器
    │   ├── composables/
    │   │   ├── usePagination.ts      # 数组内存分页逻辑封装
    │   │   ├── useRealtimeChannel.ts # WebSocket 频道自动订阅/取消订阅
    │   │   └── useResponsive.ts      # 响应式断点监听（mobile/tablet/laptop/desktop）
    │   ├── gateway/
    │   │   └── RealtimeDataGateway.ts  # WebSocket 连接管理（心跳、重连、频道发布订阅）
    │   ├── mocks/
    │   │   ├── MockWebSocketServer.ts     # 浏览器内模拟 WebSocket 服务端
    │   │   └── energyStorageDataStream.ts # 各模块实时数据生成器（8 个频道）
    │   ├── router/
    │   │   └── index.ts        # 路由配置 + 认证守卫
    │   ├── stores/
    │   │   └── user.ts         # Pinia 用户状态（token、userInfo、sidebarCollapsed）
    │   ├── types/
    │   │   └── common.ts       # 通用 TypeScript 接口（分页、选项、排序、日期范围）
    │   └── views/              # 页面组件
    │       ├── login/
    │       │   └── Login.vue
    │       ├── energy-storage/     # 储能模块（8 个页面 + 表单页）
    │       │   ├── dashboard/
    │       │   ├── monitor/
    │       │   ├── strategy/
    │       │   ├── price/
    │       │   ├── settlement/
    │       │   ├── revenue/
    │       │   ├── maintenance/
    │       │   ├── device/
    │       │   │   ├── Device.vue
    │       │   │   ├── DeviceForm.vue       # 创建设备 / 编辑设备
    │       │   │   ├── StationForm.vue      # 创建站点
    │       │   │   ├── SolarInverterForm.vue
    │       │   │   ├── SolarModuleForm.vue
    │       │   │   ├── SolarStationForm.vue
    │       │   │   ├── types.ts             # 设备领域类型
    │       │   │   ├── useDeviceManager.ts  # 设备管理逻辑 composable
    │       │   │   ├── useDeviceRealtimeSync.ts  # 设备实时数据同步
    │       │   │   ├── deviceAdapters.ts    # 数据适配器
    │       │   │   ├── deviceRepository.ts  # 数据仓库
    │       │   │   ├── mockDeviceTree.ts    # 设备树 mock 数据
    │       │   │   └── components/          # 设备页面子组件（DeviceTreePanel、DeviceDetailPanel、EmptyState）
    │       ├── solar/              # 光伏模块（4 个页面）
    │       │   ├── monitor/
    │       │   ├── metering/
    │       │   ├── device/
    │       │   └── maintenance/
    │       ├── charging-station/
    │       ├── commercial-load/
    │       ├── alarm-center/
    │       └── system/login-log/
    └── dist/                   # 生产构建产物目录
```

## 启动与构建命令

所有命令需在 `energy-platform/` 目录下执行：

```bash
# 安装依赖
npm install

# 开发服务器（默认端口 3000，监听 0.0.0.0，允许任意 host 访问）
npm run dev

# 生产构建（先执行 vue-tsc 类型检查，再执行 Vite 构建）
npm run build

# 预览生产构建
npm run preview
```

> **注意**：在 Windows PowerShell 中若遇到执行策略限制，推荐使用 CMD 运行 `npm run dev`，或参考 `energy-platform/README.md` 中的其他方式。

## 开发规范

### Vue 组件风格

- 统一使用 **Composition API** + **`<script setup lang="ts">`** 语法
- 组件导入使用 `@/` 路径别名指向 `src/`
- 模板中使用中文，注释使用中文
- 复杂样式使用 `<style scoped>` 编写自定义 CSS，通用布局优先使用 Tailwind 工具类

### 命名约定

- 组件文件：PascalCase（如 `Dashboard.vue`、`AppLayout.vue`）
- 目录名：kebab-case（如 `energy-storage/`、`alarm-center/`）
- 变量/函数：camelCase
- 类型/接口：PascalCase
- Composable 文件：`useXxx.ts`

### 代码注释规范

**所有函数/方法必须编写标准 JSDoc 格式注释**，包括：

- **函数描述**：简明说明该函数的功能与用途
- **@param**：每个参数的名称、类型、描述（TypeScript 函数可省略类型，但不可省略描述）
- **@returns**：返回值类型与含义（无返回值可省略）
- **@throws**：若函数会抛出异常，需注明
- **@example**：复杂逻辑或公共 API 建议提供用法示例

示例：

```typescript
/**
 * 根据电价类型和时间段计算总费用
 * @param type 电价类型（sharp | peak | flat | valley）
 * @param periods 时间段数组，每个包含 start 和 end
 * @returns 计算后的总费用（元），若参数无效返回 0
 * @throws {Error} 当 type 不在支持的类型列表中时抛出
 */
function calcPrice(type: string, periods: TimePeriod[]): number {
  // ...
}
```

**变量定义必须编写注释**，说明该变量的用途与含义。对于简单循环索引等显而易见的变量可省略，但业务变量、状态变量、配置常量等必须注释。

示例：

```typescript
/** 搜索关键词 */
const searchKeyword = ref('')
/** 已选中的生命周期状态筛选项 key 列表 */
const selectedStatuses = ref<string[]>(statusFilters.map((item) => item.key))
/** 心跳间隔（毫秒） */
const HEARTBEAT_INTERVAL = 30000
```

### 状态管理

- 使用 Pinia 的 **Setup Store** 风格（`defineStore` + `ref`/`computed`）
- `user.ts` 存储：
  - `token`：从 `localStorage` 初始化，登录后持久化
  - `userInfo`：默认 `{ name: '管理员' }`，登录时更新为用户名
  - `sidebarCollapsed`：控制侧边栏展开/收起（默认 `false`）
- `login()` 为 Mock 实现：仅校验非空，生成 `mock-token-${Date.now()}`
- `logout()` 清空 token 并移除 localStorage

### 路由组织

- 登录页 `/login` 为公开路由（`meta: { public: true }`）
- 业务页面统一挂载在 `AppLayout` 下
- 路由守卫 `beforeEach` 检查 `!to.meta.public && !userStore.token`，未登录则跳转 `/login`
- 子路由使用懒加载（`() => import('@/views/...')`），仅 `Login` 和 `AppLayout` 为直接加载
- 储能设备管理包含非菜单路由：`/energy-storage/device/create`、`:id/edit`、`/energy-storage/station/create`
- 通配符路由 `/:pathMatch(.*)*` 重定向到 `/`

### UI 设计规范

- **主题色**：`#02A7F0`（primary），`#0A1628`（深色背景）
- **字体**：`Microsoft YaHei`、`PingFang SC`
- **布局最小宽度**：`1920px`，适配大屏展示
- **滚动条**：自定义 WebKit 滚动条样式（细窄、深色，宽度 6px）
- 大量页面使用 SVG/PNG 背景图还原 Axure 原型视觉效果，图片存放在 `public/images/<页面名>/`
- 侧边栏收起宽度 `64px`，展开宽度 `140px`；主内容区 `paddingLeft` 同步为 `64px` / `120px`

### API 层规范（`src/api/api.js`）

- 统一 axios 实例，基础地址读取环境变量 `VITE_API_BASE_URL`，默认 `http://localhost:8080/api`
- 请求超时：30 秒
- 请求拦截器：自动从 `localStorage` 读取 `token` 并附加 `Authorization: Bearer ${token}`
- 响应拦截器：统一处理 `code !== 200` 的错误（ElMessage 提示），HTTP 状态码处理：
  - `401`：提示登录过期，清除 token，跳转到登录页
  - `403`：权限不足
  - `404`：资源不存在
  - `500`：服务器错误
- 导出命名方法：`get`、`post`、`put`、`del`
- 按业务模块导出 API 对象：`authApi`、`userApi`、`energyStorageApi`、`solarApi`、`chargingStationApi`、`commercialLoadApi`、`alarmApi`、`systemApi`

### 实时数据架构

项目内置一套 WebSocket 实时数据基础设施，用于演示和开发：

- **`src/gateway/RealtimeDataGateway.ts`**：单例类管理 WebSocket 连接
  - 环境变量 `VITE_WS_URL`（默认 `ws://mock-local/energy-storage`）
  - URL 包含 `'mock'` 时自动切换为 Mock 模式
  - 心跳间隔 30 秒，断线重连采用指数退避（1s ~ 30s）
  - 支持按频道（channel）订阅/取消订阅
- **`src/mocks/MockWebSocketServer.ts`**：浏览器内模拟 WebSocket 服务端，无需真实后端即可接收推送数据
- **`src/mocks/energyStorageDataStream.ts`**：为 8 个频道生成周期性模拟数据（`monitor` 100ms、`dashboard` 1s、`strategy` 5s 等）
- **`src/composables/useRealtimeChannel.ts`**：封装 `onMounted` 订阅 + `onUnmounted` 取消订阅的生命周期

## 测试说明

本项目**目前没有集成测试框架**，不存在任何 `.test.*`、`.spec.*` 文件，也没有 Vitest、Jest、Cypress、Playwright 配置。

- 需要新增测试时，推荐在 `energy-platform/` 下引入 **Vitest** 进行单元测试，或 **Playwright** 进行 E2E 测试。
- 当前验证方式以手动页面浏览为主。

## 安全注意事项

- **认证机制为 Mock 实现**：`userStore.login()` 仅校验非空，生成假 token 写入 `localStorage`，没有真实后端接口。
- **默认账号**：`admin` / `admin123`
- 若接入真实后端，需替换 `stores/user.ts` 中的登录逻辑，使用 HTTPS 传输敏感信息，并妥善处理 token 过期与刷新机制。
- 构建产物 `dist/` 为纯静态文件，部署时建议配置反向代理（Nginx）并开启 HTTPS。
- `api.js` 中已预留 `Authorization` 请求拦截器和 401 自动跳转逻辑，接入真实后端时可直接复用。

## 资产来源与维护

- `public/images/` 下的图片资源大部分从 Axure 原型导出（`u####.svg` / `u####.png` / `u####_div.png` 等命名），按页面模块分目录存放。
- 新增页面如需使用原型中的素材，可从根目录 `images/` 或 `files/` 中查找对应资源，复制到 `public/images/` 下引用。
- 引用静态资源时使用绝对路径，如 `/images/储能-可视看板/u3492.svg`。

## 环境变量

项目当前**没有提交 `.env` 文件**，以下变量在代码中被使用，可通过创建 `.env` 或 `.env.local` 配置：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | REST API 基础地址 |
| `VITE_WS_URL` | `ws://mock-local/energy-storage` | WebSocket 地址（含 `'mock'` 则启用 Mock） |

> Vite 要求环境变量必须以 `VITE_` 开头才能在客户端代码中通过 `import.meta.env` 访问。

## 实用脚本

`energy-platform/` 目录下存在以下 Python 辅助脚本：

- `gen_form_dialog.py` —— 根据模板批量生成 Vue 表单弹窗组件
- `patch_strategy.py` —— 修补策略页面代码
- `src/views/energy-storage/monitor/gen_monitor.py` —— 批量生成监控页面子组件

这些脚本**不属于构建流程**，仅在需要批量生成相似结构组件时手工执行。它们不会随 `npm run build` 被调用。