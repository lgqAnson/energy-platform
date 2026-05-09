# 新能源一体化协同调控平台 - Code Wiki

## 目录

- [1. 项目概述](#1-项目概述)
- [2. 技术栈](#2-技术栈)
- [3. 架构设计](#3-架构设计)
  - [3.1 整体架构](#31-整体架构)
  - [3.2 目录结构](#32-目录结构)
  - [3.3 分层架构](#33-分层架构)
- [4. 核心模块详解](#4-核心模块详解)
  - [4.1 状态管理 (Pinia Stores)](#41-状态管理-pinia-stores)
  - [4.2 API 层](#42-api-层)
  - [4.3 路由系统](#43-路由系统)
  - [4.4 布局组件](#44-布局组件)
- [5. 实时数据架构](#5-实时数据架构)
  - [5.1 架构概览](#51-架构概览)
  - [5.2 RealtimeDataGateway](#52-realtimedatagateway)
  - [5.3 Mock 系统](#53-mock-系统)
  - [5.4 频道与数据流](#54-频道与数据流)
- [6. Composables](#6-composables)
  - [6.1 useAsyncState](#61-useasyncstate)
  - [6.2 usePagination](#62-usepagination)
  - [6.3 useRealtimeChannel](#63-userealtimechannel)
  - [6.4 useResponsive](#64-useresponsive)
  - [6.5 useConnectionStatus](#65-useconnectionstatus)
- [7. 组件库](#7-组件库)
  - [7.1 通用组件](#71-通用组件)
  - [7.2 业务组件](#72-业务组件)
- [8. 业务模块](#8-业务模块)
  - [8.1 储能模块](#81-储能模块)
  - [8.2 光伏模块](#82-光伏模块)
  - [8.3 其他业务模块](#83-其他业务模块)
- [9. 类型定义](#9-类型定义)
- [10. 环境变量](#10-环境变量)
- [11. 测试架构](#11-测试架构)
- [12. 代码规范](#12-代码规范)
- [13. 安全注意事项](#13-安全注意事项)
- [14. 开发指南](#14-开发指南)
  - [14.1 快速开始](#141-快速开始)
  - [14.2 常用命令](#142-常用命令)
  - [14.3 新增页面指南](#143-新增页面指南)
  - [14.4 接入真实后端](#144-接入真实后端)
- [15. 依赖关系图](#15-依赖关系图)

---

## 1. 项目概述

**新能源一体化协同调控平台**是一个面向大屏展示的现代 Web 应用，用于实时监控与运营管理储能、光伏、充电桩、工商业负荷等新能源业务。

### 核心特性

- **多业务模块支持**：储能、光伏、充电桩、工商业负荷、告警中心、系统管理
- **实时数据监控**：基于 WebSocket 的实时数据推送与可视化
- **双模式运行**：支持 Mock 模式（离线演示）和 API 模式（联调后端）
- **响应式布局**：适配手机、平板、笔记本、桌面大屏等多种设备
- **权限控制**：基于角色的菜单可见性与路由访问控制
- **3D 场景展示**：集成 Three.js 实现储能场景 3D 可视化

### 目标用户角色

| 角色 | 说明 |
|------|------|
| `admin` | 管理员，拥有所有权限 |
| `operator` | 操作员，可执行业务操作 |
| `viewer` | 访客，仅查看权限 |
| `engineer` | 工程师，设备与策略配置权限 |

---

## 2. 技术栈

### 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.4.21 | 前端框架 (Composition API + `<script setup>`) |
| TypeScript | 5.4.2 | 类型系统 |
| Vite | 5.1.6 | 构建工具与开发服务器 |
| Vue Router | 4.3.0 | 路由管理 |
| Pinia | 2.1.7 | 状态管理 |

### UI 与可视化

| 技术 | 版本 | 用途 |
|------|------|------|
| Element Plus | 2.6.1 | UI 组件库 |
| Tailwind CSS | 3.4.17 | 原子化 CSS |
| ECharts | 5.5.0 | 数据可视化图表 |
| vue-echarts | 6.6.9 | ECharts Vue 封装 |
| Three.js | 0.184.0 | 3D 渲染 |
| lucide-vue-next | 0.344.0 | 图标库 |
| FontAwesome | 6.5.1 | 品牌图标 |

### 网络与工具

| 技术 | 版本 | 用途 |
|------|------|------|
| axios | 1.6.8 | HTTP 客户端 |
| dayjs | 1.11.20 | 日期处理 |
| xlsx | 0.18.5 | Excel 导出 |

### 质量工具

| 技术 | 版本 | 用途 |
|------|------|------|
| ESLint | 10.2.1 | 代码检查 |
| Prettier | 3.8.3 | 代码格式化 |
| Vitest | 4.1.5 | 单元测试 |
| Playwright | 1.59.1 | E2E 测试 |
| vue-tsc | 2.0.6 | Vue 类型检查 |

---

## 3. 架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        浏览器客户端                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Views 层   │  │ Components  │  │    Composables          │  │
│  │ (页面组件)   │  │  (通用/业务) │  │  (可复用逻辑)           │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────────┘  │
│         │                │                     │                │
│         └────────────────┼─────────────────────┘                │
│                          │                                     │
│  ┌───────────────────────┼───────────────────────────────────┐  │
│  │                      ▼                                    │  │
│  │              Pinia Stores (状态管理)                       │  │
│  │  ┌─────────────────────┐  ┌────────────────────────────┐  │  │
│  │  │    user.ts          │  │   energyStorage.ts         │  │  │
│  │  │ (用户认证/状态)      │  │ (储能实时数据/WS管理)       │  │  │
│  │  └─────────────────────┘  └────────────────────────────┘  │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          │                                     │
│  ┌───────────────────────┼───────────────────────────────────┐  │
│  │                      ▼                                    │  │
│  │              Data Access Layer                            │  │
│  │  ┌─────────────────────┐  ┌────────────────────────────┐  │  │
│  │  │   api.ts (REST API) │  │ RealtimeDataGateway (WS)   │  │  │
│  │  └─────────────────────┘  └────────────────────────────┘  │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          │                                     │
├──────────────────────────┼─────────────────────────────────────┤
│                          │                                     │
│  ┌───────────────────────┼───────────────────────────────────┐  │
│  │              Mock 层 (开发/演示)                           │  │
│  │  ┌─────────────────────┐  ┌────────────────────────────┐  │  │
│  │  │ MockWebSocketServer │  │ energyStorageDataStream    │  │  │
│  │  │ (模拟WS服务端)       │  │ (实时数据生成器)            │  │  │
│  │  └─────────────────────┘  └────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 目录结构

```
energy-platform/
├── public/
│   └── images/                     # 静态图片资源（按页面模块分目录）
│       ├── 储能-可视看板/
│       ├── 储能-实时监控/
│       ├── 登录/
│       └── ...
├── src/
│   ├── main.ts                     # 应用入口
│   ├── App.vue                     # 根组件
│   ├── assets/
│   │   └── index.css               # 全局样式 + Tailwind + CSS 变量
│   ├── api/
│   │   └── api.ts                  # axios 实例 + 拦截器 + 业务 API
│   ├── components/
│   │   ├── layout/                 # 布局组件
│   │   │   ├── AppLayout.vue       # 主布局容器
│   │   │   ├── AppHeader.vue       # 顶部导航栏
│   │   │   └── AppSidebar.vue      # 左侧边栏
│   │   ├── common/                 # 通用组件
│   │   │   ├── AsyncPanel.vue      # 异步数据加载面板
│   │   │   ├── CardPanel.vue       # 渐变卡片容器
│   │   │   ├── ConnectionStatus.vue# WS 连接状态指示器
│   │   │   ├── LifecycleManager.vue# 设备生命周期管理
│   │   │   └── ModuleTabs.vue      # 通用模块子导航
│   │   └── business/               # 业务组件
│   │       ├── CalendarPicker.vue  # 日历日期选择器
│   │       ├── ModalDialog.vue     # 通用弹窗容器
│   │       ├── PanelCard.vue       # 渐变面板卡片
│   │       └── WorkOrderManager.vue# 工单管理器
│   ├── composables/                # 可复用逻辑 (Composition API)
│   │   ├── useAsyncState.ts        # 异步状态管理
│   │   ├── useConnectionStatus.ts  # WS 连接状态
│   │   ├── usePagination.ts        # 客户端分页
│   │   ├── useRealtimeChannel.ts   # WS 频道订阅生命周期
│   │   └── useResponsive.ts        # 响应式断点
│   ├── constants/
│   │   └── navigation.ts           # 导航常量配置
│   ├── gateway/
│   │   └── RealtimeDataGateway.ts  # WebSocket 连接管理（单例）
│   ├── mocks/
│   │   ├── MockWebSocketServer.ts  # 浏览器内模拟 WS 服务端
│   │   └── energyStorageDataStream.ts # 实时数据生成器
│   ├── router/
│   │   └── index.ts                # 路由配置 + 认证守卫
│   ├── stores/
│   │   ├── user.ts                 # 用户状态 Store
│   │   └── energyStorage.ts        # 储能数据 Store
│   ├── types/
│   │   └── common.ts               # 通用 TypeScript 接口
│   ├── utils/
│   │   └── env.ts                  # 环境变量辅助
│   └── views/                      # 页面组件
│       ├── login/
│       │   └── Login.vue
│       ├── energy-storage/         # 储能模块 (8 个子页面)
│       │   ├── dashboard/          # 可视看板
│       │   ├── monitor/            # 实时监控
│       │   ├── strategy/           # 策略控制
│       │   ├── price/              # 电价管理
│       │   ├── settlement/         # 抄表结算
│       │   ├── revenue/            # 收益管理
│       │   ├── maintenance/        # 运维管理
│       │   └── device/             # 设备管理
│       ├── solar/                  # 光伏模块
│       ├── charging-station/       # 充电桩模块
│       ├── commercial-load/        # 工商业负荷模块
│       ├── alarm-center/           # 告警中心
│       └── system/                 # 系统管理
├── tests/
│   ├── e2e/                        # Playwright E2E 测试
│   ├── fixtures/                   # 测试夹具
│   ├── setup.ts                    # Vitest 全局 setup
│   └── unit/                       # Vitest 单元测试
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── eslint.config.js
├── .prettierrc
├── tailwind.config.js
└── tsconfig.json
```

### 3.3 分层架构

项目采用清晰的分层架构，从上到下分为：

1. **View 层** (`src/views/`)：页面组件，负责页面布局与业务逻辑组合
2. **Component 层** (`src/components/`)：可复用的 UI 组件
3. **Composable 层** (`src/composables/`)：可复用的业务逻辑
4. **Store 层** (`src/stores/`)：全局状态管理
5. **Data Access 层** (`src/api/` + `src/gateway/`)：数据访问层

**数据流向**：

```
用户交互 → View 组件 → Composable/Store → API/Gateway → 后端/Mock → 响应 → Store 更新 → View 重新渲染
```

---

## 4. 核心模块详解

### 4.1 状态管理 (Pinia Stores)

项目使用 Pinia 的 Setup Store 风格（`defineStore` + `ref`/`computed`）。

#### 4.1.1 `stores/user.ts` - 用户状态管理

**职责**：管理用户认证信息、用户资料、侧边栏折叠状态。

**核心状态**：

| 状态 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `token` | `string` | `localStorage.getItem('token') || ''` | 认证令牌 |
| `userInfo` | `UserInfo` | `{ name: '管理员' }` | 用户基本信息 |
| `sidebarCollapsed` | `boolean` | `false` | 侧边栏是否折叠 |

**核心方法**：

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `login()` | `{ username, password }` | `Promise<boolean>` | 用户登录（支持 Mock/API 双模式） |
| `logout()` | - | `Promise<void>` | 用户登出 |
| `toggleSidebar()` | - | `void` | 切换侧边栏折叠状态 |
| `setSidebarCollapsed()` | `boolean` | `void` | 设置侧边栏折叠状态 |

**Mock 账号库**：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| `admin` | `admin123` | `admin` |
| `operator` | `operator123` | `operator` |
| `viewer` | `viewer123` | `viewer` |
| `engineer` | `engineer123` | `engineer` |

#### 4.1.2 `stores/energyStorage.ts` - 储能数据管理

**职责**：集中管理储能模块共享的实时数据，内置 WebSocket 频道引用计数管理。

**核心状态**：

| 状态 | 类型 | 说明 |
|------|------|------|
| `energyGroups` | `EnergyGroupItem[]` | 能量组监控数据 |
| `energyBlockMonitors` | `EnergyBlockItem[]` | 能量块监控数据 |
| `topologyData` | `{ groups, blocks }` | 拓扑结构数据 |
| `meterData` | `MeterRow[]` | 电表监控数据 |
| `realtimeSeries` | `RealtimeChartSeries` | 实时曲线数据（xData, gatePower, gridPower, chargeDischargePower） |
| `stationStats` | `StationStats[]` | 看板统计数据 |
| `loading` | `boolean` | 全局加载状态 |

**核心方法**：

| 方法 | 说明 |
|------|------|
| `loadStationStats()` | 加载看板统计数据（仅 API 模式） |
| `loadMonitorInitData()` | 加载监控初始数据（仅 API 模式） |
| `startMonitorRealtime()` | 启动监控实时数据订阅 |
| `stopMonitorRealtime()` | 停止监控实时数据订阅 |
| `activateChannel()` | 激活频道（引用计数 +1） |
| `deactivateChannel()` | 停用频道（引用计数 -1，归零时取消订阅） |

**引用计数机制**：

```
页面A订阅频道 "monitor" → refCount: 1 → 建立WS订阅
页面B订阅频道 "monitor" → refCount: 2 → 复用现有WS订阅
页面A离开             → refCount: 1 → 保持WS订阅
页面B离开             → refCount: 0 → 取消WS订阅
```

### 4.2 API 层

**文件**：`src/api/api.ts`

#### 4.2.1 axios 实例配置

```typescript
const request = axios.create({
  baseURL: apiBaseUrl,           // 默认: http://localhost:8080/api
  timeout: 30000,                // 30秒超时
  headers: { 'Content-Type': 'application/json;charset=UTF-8' }
})
```

#### 4.2.2 请求拦截器

- 自动从 `localStorage` 读取 `token` 并附加到请求头：`Authorization: Bearer ${token}`

#### 4.2.3 响应拦截器

| HTTP 状态码 | 处理方式 |
|-------------|----------|
| `code !== 200` | `ElMessage.error()` 提示错误 |
| `401` | 提示登录过期，清除 token，跳转登录页 |
| `403` | 提示权限不足 |
| `404` | 提示资源不存在 |
| `500` | 提示服务器内部错误 |
| `timeout` | 提示请求超时 |
| 网络异常 | 提示检查网络连接 |

#### 4.2.4 业务 API 模块

| 模块 | 导出对象 | 主要接口 |
|------|----------|----------|
| 认证 | `authApi` | `login`, `logout`, `getUserInfo`, `changePassword` |
| 用户管理 | `userApi` | `getList`, `getDetail`, `create`, `update`, `remove` |
| 储能管理 | `energyStorageApi` | 看板、监控、策略、电价、结算、收益、设备、运维 |
| 光伏管理 | `solarApi` | 监控、计量能效、设备、运维 |
| 充电桩 | `chargingStationApi` | `getList`, `getDetail`, `getRealTimeData`, `getRecordList` |
| 工商业负荷 | `commercialLoadApi` | `getLoadData`, `getForecast`, `getLoadCurve` |
| 告警中心 | `alarmApi` | `getList`, `getStatistics`, `confirm`, `clear`, `getRuleList` |
| 系统管理 | `systemApi` | `getLoginLogList`, `getResourceRelation`, `getParkList` |

### 4.3 路由系统

**文件**：`src/router/index.ts`

#### 4.3.1 路由结构

```
/login                          → Login.vue (公开路由)
/                               → 重定向到 /energy-storage/dashboard
/energy-storage/dashboard       → Dashboard.vue (储能-可视看板)
/energy-storage/monitor         → Monitor.vue (储能-实时监控)
/energy-storage/strategy        → Strategy.vue (储能-策略控制)
/energy-storage/price           → Price.vue (储能-电价管理)
/energy-storage/settlement      → Settlement.vue (储能-抄表结算)
/energy-storage/revenue         → Revenue.vue (储能-收益管理)
/energy-storage/maintenance     → Maintenance.vue (储能-运维管理)
/energy-storage/device          → Device.vue (储能-设备管理)
/energy-storage/device/create   → DeviceForm.vue (非菜单路由)
/energy-storage/device/:id/edit → DeviceForm.vue (非菜单路由)
/energy-storage/station/create  → StationForm.vue (非菜单路由)
/solar/monitor                  → Monitor.vue (光伏-实时监控)
/solar/metering                 → Metering.vue (光伏-计量与能效)
/solar/device                   → Device.vue (光伏-设备管理)
/solar/maintenance              → Maintenance.vue (光伏-运维管理)
/charging-station               → ChargingStation.vue (充电桩)
/commercial-load                → CommercialLoad.vue (工商业负荷)
/alarm-center                   → AlarmCenter.vue (告警中心)
/login-log                      → LoginLog.vue (系统-登录日志, 仅admin)
/:pathMatch(.*)*                → 重定向到 /
```

#### 4.3.2 路由守卫

```typescript
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  // 1. 非公开路由 + 无 token → 跳转登录
  if (!to.meta.public && !userStore.token) {
    next('/login')
    return
  }
  // 2. 登录日志仅 admin 可访问
  if (to.path === '/login-log' && userStore.userInfo.role !== 'admin') {
    next('/')
    return
  }
  next()
})
```

#### 4.3.3 路由元信息 (meta)

| 字段 | 类型 | 说明 |
|------|------|------|
| `public` | `boolean` | 是否为公开路由（无需登录） |
| `title` | `string` | 页面标题 |
| `menu` | `string` | 所属主菜单标识 |

#### 4.3.4 懒加载策略

- `Login.vue` 和 `AppLayout.vue`：直接加载
- 所有业务页面：使用 `() => import('@/views/...')` 动态导入

### 4.4 布局组件

#### 4.4.1 `AppLayout.vue` - 主布局容器

**职责**：提供全局页面布局框架，包含背景图、侧边栏、顶部导航和主内容区。

**布局结构**：

```
┌──────────────────────────────────────────────────────────────┐
│                       全屏背景图 (fixed)                      │
│  ┌────────────┬──────────────────────────────────────────────┐│
│  │  Sidebar   │              Header                          ││
│  │ (fixed)    │         (fixed, top)                         ││
│  │            ├──────────────────────────────────────────────┤│
│  │  64px /    │                                              ││
│  │  140px     │           Main Content                       ││
│  │            │         (router-view)                        ││
│  │            │                                              ││
│  └────────────┴──────────────────────────────────────────────┘│
│                   ConnectionStatus (右下角)                    │
└──────────────────────────────────────────────────────────────┘
```

**响应式行为**：

| 设备类型 | 侧边栏行为 |
|----------|------------|
| 桌面 (>1600px) | 展开 140px，可折叠为 64px |
| 笔记本 (1200-1600px) | 自动折叠为 64px |
| 平板/手机 (<1200px) | 覆盖模式，默认隐藏，点击展开 |

#### 4.4.2 `AppSidebar.vue` - 左侧边栏

**职责**：提供主导航菜单，支持角色过滤、路由高亮、折叠/展开。

**菜单分组**：

| 分组 | 菜单项 | 角色限制 |
|------|--------|----------|
| 业务模块 | 设备管理、储能、光伏、充电桩、工商业负荷、告警中心 | 无 |
| 系统管理 | 登录日志 | `admin` |

**路由匹配策略**：

- 精确匹配：`route.path === matchPath`
- 前缀匹配：`route.path.startsWith(matchPath + '/')`
- 最长匹配优先：当多个菜单前缀冲突时，选择路径最长的匹配项

#### 4.4.3 `AppHeader.vue` - 顶部导航栏

**职责**：显示页面标题、实时时钟、用户信息下拉菜单（包含登出、修改密码等操作）。

---

## 5. 实时数据架构

### 5.1 架构概览

项目内置一套完整的 WebSocket 实时数据基础设施，支持 **Mock 模式**和 **API 模式** 双模式运行。

```
┌─────────────────────────────────────────────────────────────────┐
│                        实时数据架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────────────────────────────┐     │
│  │   页面组件    │  │        useRealtimeChannel            │     │
│  │  (订阅方)     │  │   (onMounted订阅 / onUnmounted取消)  │     │
│  └──────┬───────┘  └──────────────┬───────────────────────┘     │
│         │                         │                             │
│         │  subscribe(channel)     │                             │
│         ▼                         ▼                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              RealtimeDataGateway (单例)                   │   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │   │
│  │  │  subscribers │  │  heartbeat  │  │  reconnect       │  │   │
│  │  │  (频道路由)  │  │  (30s间隔)  │  │  (指数退避1-30s) │  │   │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘  │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │                                     │
│  ┌────────────────────────┼─────────────────────────────────┐   │
│  │                        │                                 │   │
│  │  ┌─────────────────────┴──────────────────────────────┐  │   │
│  │  │              WebSocket 连接层                       │  │   │
│  │  │                                                    │  │   │
│  │  │  Mock模式: MockWebSocket → MockWebSocketServer     │  │   │
│  │  │  API模式:  真实 WebSocket → 后端服务                │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 RealtimeDataGateway

**文件**：`src/gateway/RealtimeDataGateway.ts`

**设计模式**：单例模式，确保全局只有一个 WebSocket 连接。

#### 5.2.1 核心属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `ws` | `WebSocket \| MockWebSocket \| null` | WebSocket 实例 |
| `subscribers` | `Map<string, Set<(data) => void>>` | 频道订阅者映射 |
| `heartbeatTimer` | `SetInterval \| null` | 心跳定时器 |
| `reconnectTimer` | `SetTimeout \| null` | 重连定时器 |
| `reconnectAttempts` | `number` | 重连尝试次数 |
| `status` | `Ref<'connecting'\|'open'\|'closed'\|'error'>` | 连接状态（响应式） |

#### 5.2.2 核心方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `connect()` | - | `void` | 建立 WebSocket 连接 |
| `disconnect()` | - | `void` | 断开连接 |
| `subscribe()` | `channel`, `callback` | `() => void` | 订阅频道，返回取消订阅函数 |
| `unsubscribeAll()` | `channel` | `void` | 取消频道所有订阅 |
| `handleMessage()` | `raw: string` | `void` | 解析并分发消息 |
| `startHeartbeat()` | - | `void` | 启动心跳（30s 间隔） |
| `stopHeartbeat()` | - | `void` | 停止心跳 |
| `scheduleReconnect()` | - | `void` | 调度重连（指数退避） |

#### 5.2.3 重连策略（指数退避）

```
延迟 = min(1s × 2^attempts, 30s)

第1次重连: 1s
第2次重连: 2s
第3次重连: 4s
第4次重连: 8s
第5次重连: 16s
第6次及以后: 30s (上限)
```

#### 5.2.4 消息格式

**发送（心跳）**：
```json
{ "type": "ping", "ts": 1715000000000 }
```

**接收（数据推送）**：
```json
{
  "channel": "monitor",
  "payload": { /* 频道数据 */ },
  "ts": 1715000000000
}
```

**接收（心跳响应）**：
```json
{ "type": "pong", "ts": 1715000000000 }
```

### 5.3 Mock 系统

#### 5.3.1 `MockWebSocketServer.ts`

**职责**：浏览器内模拟 WebSocket 服务端，无需真实后端即可实现实时数据推送。

**特性**：
- 完全模拟原生 WebSocket API（`readyState`, `onopen`, `onmessage`, `onclose`, `onerror`）
- 管理所有 Mock 连接的注册与注销
- 自动启动各频道的定时数据推送

#### 5.3.2 数据推送频道

| 频道 | 间隔 | 数据类型 |
|------|------|----------|
| `monitor` | 100ms | 功率/SOC/温度/电压/电流/电表/实时曲线 |
| `dashboard` | 100ms | 统计卡片/锚点状态 |
| `strategy` | 5s | 策略执行数据 |
| `revenue` | 5s | 收益数据 |
| `settlement` | 5s | 结算数据 |
| `device` | 5s | 设备状态数据 |
| `price` | 10s | 价格数据 |
| `maintenance` | 10s | 运维数据 |

#### 5.3.3 `energyStorageDataStream.ts`

**职责**：为各频道生成周期性模拟数据，包含：
- 随机波动算法（模拟真实设备数据变化）
- 时间戳生成
- 多频道数据隔离

### 5.4 频道与数据流

#### 5.4.1 数据订阅流程

```
1. 页面组件挂载 (onMounted)
2. 调用 useRealtimeChannel('monitor', handler)
3. RealtimeDataGateway.subscribe('monitor', handler)
4. 记录订阅者到 subscribers Map
5. 接收 WebSocket 消息 → handleMessage → 路由到 'monitor' 频道
6. 遍历所有订阅者回调 → 执行 handler(data)
7. 页面组件卸载 (onUnmounted)
8. 调用取消订阅函数 → 从 subscribers 移除
```

#### 5.4.2 Store 级引用计数

```typescript
// energyStorage.ts
const channelRefCount = new Map<string, number>()

function activateChannel(channel: string, handler: (data) => void) {
  const count = channelRefCount.get(channel) || 0
  channelRefCount.set(channel, count + 1)
  // 首次订阅才建立 WebSocket 连接
  if (!activeChannels.has(channel)) {
    const unsub = realtimeGateway.subscribe(channel, handler)
    activeChannels.set(channel, unsub)
  }
}

function deactivateChannel(channel: string) {
  const count = channelRefCount.get(channel) || 1
  if (count <= 1) {
    activeChannels.get(channel)?.()
    activeChannels.delete(channel)
    channelRefCount.delete(channel)
  } else {
    channelRefCount.set(channel, count - 1)
  }
}
```

---

## 6. Composables

### 6.1 useAsyncState

**文件**：`src/composables/useAsyncState.ts`

**用途**：为数据加载场景提供统一的 `loading` / `error` / `empty` 状态管理。

**返回值**：

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `loading` | `Ref<boolean>` | 是否正在加载 |
| `error` | `Ref<string \| null>` | 错误信息 |
| `data` | `Ref<T \| null>` | 加载的数据 |
| `isEmpty` | `Ref<boolean>` | 数据是否为空 |
| `isReady` | `Ref<boolean>` | 是否加载完成且数据非空 |
| `execute()` | `(fetcher) => Promise<void>` | 执行异步加载 |
| `reset()` | `() => void` | 重置状态 |

**使用示例**：

```typescript
const { loading, error, data, isReady, execute } = useAsyncState<User[]>([])

async function fetchUsers() {
  await execute(() => userApi.getList({ page: 1, pageSize: 10 }))
}
```

### 6.2 usePagination

**文件**：`src/composables/usePagination.ts`

**用途**：对已加载到前端的列表数据进行客户端分页。

**参数**：
- `list: T[]` - 源数据数组
- `defaultSize = 10` - 每页默认条数

**返回值**：

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `page` | `Ref<number>` | 当前页码（从 1 开始） |
| `pageSize` | `Ref<number>` | 每页条数 |
| `total` | `ComputedRef<number>` | 总条数 |
| `totalPages` | `ComputedRef<number>` | 总页数 |
| `paginated` | `ComputedRef<T[]>` | 当前页数据切片 |
| `pageList` | `ComputedRef<number[]>` | 页码数组（用于渲染分页导航） |
| `reset()` | `() => void` | 重置到第一页 |

### 6.3 useRealtimeChannel

**文件**：`src/composables/useRealtimeChannel.ts`

**用途**：自动管理 WebSocket 频道的订阅与取消订阅生命周期。

**参数**：
- `channel: string` - 频道名称
- `callback: (data) => void` - 数据到达时的回调

**生命周期**：
- `onMounted` → 订阅频道
- `onUnmounted` → 取消订阅

**使用示例**：

```typescript
useRealtimeChannel('monitor', (data) => {
  // 处理实时监控数据
})
```

### 6.4 useResponsive

**文件**：`src/composables/useResponsive.ts`

**用途**：提供单例模式的窗口尺寸监听与断点判断能力。

**断点定义**：

| 断点 | 范围 | 设备 |
|------|------|------|
| `mobile` | < 768px | 手机 |
| `tablet` | 768-1199px | 平板 |
| `laptop` | 1200-1599px | 笔记本 |
| `desktop` | ≥ 1600px | 桌面 |

**返回值**：

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `windowWidth` | `Readonly<Ref<number>>` | 窗口宽度 |
| `windowHeight` | `Readonly<Ref<number>>` | 窗口高度 |
| `breakpoint` | `ComputedRef<Breakpoint>` | 当前断点 |
| `isMobile` | `ComputedRef<boolean>` | 是否为手机 |
| `isTablet` | `ComputedRef<boolean>` | 是否为平板 |
| `isLaptop` | `ComputedRef<boolean>` | 是否为笔记本 |
| `isDesktop` | `ComputedRef<boolean>` | 是否为桌面 |
| `isTouch` | `ComputedRef<boolean>` | 是否为触屏设备 |
| `isBelow(bp)` | `(bp) => boolean` | 是否小于指定断点 |
| `isAbove(bp)` | `(bp) => boolean` | 是否大于等于指定断点 |

**引用计数机制**：

```
组件A挂载 → listenerCount: 1 → 注册resize监听
组件B挂载 → listenerCount: 2 → 复用现有监听
组件A卸载 → listenerCount: 1 → 保持监听
组件B卸载 → listenerCount: 0 → 移除resize监听
```

### 6.5 useConnectionStatus

**文件**：`src/composables/useConnectionStatus.ts`

**用途**：提供响应式 WebSocket 连接状态。

**返回值**：
- `status: Ref<'connecting' | 'open' | 'closed' | 'error'>`

---

## 7. 组件库

### 7.1 通用组件

| 组件 | 文件 | 用途 | Props |
|------|------|------|-------|
| `AsyncPanel` | `AsyncPanel.vue` | 异步数据加载面板（统一处理 loading/error/empty 状态） | `loading`, `error`, `empty`, `title` |
| `CardPanel` | `CardPanel.vue` | 渐变卡片容器 | `title`, `gradient` |
| `ConnectionStatus` | `ConnectionStatus.vue` | WebSocket 连接状态指示器（右下角悬浮） | - |
| `LifecycleManager` | `LifecycleManager.vue` | 设备全生命周期管理（7 阶段时间轴） | `stages`, `currentStage` |
| `ModuleTabs` | `ModuleTabs.vue` | 通用模块子导航标签栏 | `tabs`, `activeTab` |

### 7.2 业务组件

| 组件 | 文件 | 用途 |
|------|------|------|
| `CalendarPicker` | `CalendarPicker.vue` | 日历日期选择器（策略表单弹窗复用） |
| `ModalDialog` | `ModalDialog.vue` | 通用弹窗容器 |
| `PanelCard` | `PanelCard.vue` | 渐变面板卡片容器 |
| `WorkOrderManager` | `WorkOrderManager.vue` | 工单管理器（运维管理页面复用） |

---

## 8. 业务模块

### 8.1 储能模块

储能模块是项目的核心业务模块，包含 8 个子页面。

#### 8.1.1 可视看板 (`dashboard/`)

**路由**：`/energy-storage/dashboard`

**职责**：展示储能系统全局概览，包含 3D 场景、收益统计、充放电分析。

**子组件**：

| 组件 | 文件 | 说明 |
|------|------|------|
| `Scene3DPanel` | `Scene3DPanel.vue` | Three.js 3D 场景展示 |
| `StationOverviewPanel` | `StationOverviewPanel.vue` | 站点概览统计卡片 |
| `RevenueStatsPanel` | `RevenueStatsPanel.vue` | 收益统计图表 |
| `ChargeAnalysisPanel` | `ChargeAnalysisPanel.vue` | 充放电分析图表 |
| `AlarmStatsPanel` | `AlarmStatsPanel.vue` | 告警统计面板 |

#### 8.1.2 实时监控 (`monitor/`)

**路由**：`/energy-storage/monitor`

**职责**：实时监控储能设备运行状态，包含拓扑图、能量组/块监控、电表监控。

**子组件**：

| 组件 | 文件 | 说明 |
|------|------|------|
| `TopologyPanel` | `TopologyPanel.vue` | 拓扑结构可视化 |
| `EnergyGroupMonitor` | `EnergyGroupMonitor.vue` | 能量组状态监控 |
| `EnergyBlockMonitor` | `EnergyBlockMonitor.vue` | 能量块状态监控 |
| `MeterMonitor` | `MeterMonitor.vue` | 电表数据监控 |
| `ChargeDischargeCharts` | `ChargeDischargeCharts.vue` | 充放电功率曲线 |
| `WeatherPanel` | `WeatherPanel.vue` | 天气信息面板 |
| `ChargeRecordDialog` | `ChargeRecordDialog.vue` | 充电记录弹窗 |

**类型定义**：`types.ts`
- `EnergyGroupItem` - 能量组数据结构
- `EnergyBlockItem` - 能量块数据结构
- `MeterRow` - 电表行数据
- `TopologyGroup` / `TopologyBlock` - 拓扑节点
- `RealtimeChartSeries` - 实时曲线数据
- `MonitorRealtimePayload` - 监控实时推送载荷

#### 8.1.3 策略控制 (`strategy/`)

**路由**：`/energy-storage/strategy`

**职责**：管理储能充放电策略，包含策略表单、执行图表、历史记录。

**子组件**：

| 组件 | 文件 | 说明 |
|------|------|------|
| `StrategyFormDialog` | `StrategyFormDialog.vue` | 策略表单弹窗 |
| `StrategyEffectTable` | `StrategyEffectTable.vue` | 策略效果对比表 |
| `StrategyExecutionChart` | `StrategyExecutionChart.vue` | 策略执行曲线图 |
| `StrategyHistoryDialog` | `StrategyHistoryDialog.vue` | 执行历史弹窗 |
| `StrategyManageDialog` | `StrategyManageDialog.vue` | 策略管理弹窗 |

#### 8.1.4 电价管理 (`price/`)

**路由**：`/energy-storage/price`

**职责**：管理电价时段设置与历史价格查询。

**子组件**：

| 组件 | 文件 | 说明 |
|------|------|------|
| `PriceSettingSection` | `PriceSettingSection.vue` | 电价设置区域 |
| `TimeSettingSection` | `TimeSettingSection.vue` | 时段设置区域 |
| `PriceHistoryDialog` | `PriceHistoryDialog.vue` | 历史价格弹窗 |

**数据文件**：`data/regionData.ts` - 各地区电价数据

#### 8.1.5 抄表结算 (`settlement/`)

**路由**：`/energy-storage/settlement`

**职责**：展示电表数据与结算信息。

**子组件**：

| 组件 | 文件 | 说明 |
|------|------|------|
| `MeterDataSection` | `MeterDataSection.vue` | 电表数据区域 |
| `MeterBaseDialog` | `MeterBaseDialog.vue` | 基表信息弹窗 |

#### 8.1.6 收益管理 (`revenue/`)

**路由**：`/energy-storage/revenue`

**职责**：展示收益图表、收益列表、数据导出。

**子组件**：

| 组件 | 文件 | 说明 |
|------|------|------|
| `RevenueChart` | `RevenueChart.vue` | 收益趋势图表 |
| `RevenueTable` | `RevenueTable.vue` | 收益明细表格 |
| `ExportPanel` | `ExportPanel.vue` | 数据导出面板 |

#### 8.1.7 运维管理 (`maintenance/`)

**路由**：`/energy-storage/maintenance`

**职责**：运维工单管理（复用 `WorkOrderManager` 组件）。

#### 8.1.8 设备管理 (`device/`)

**路由**：`/energy-storage/device`

**职责**：管理储能设备树、设备详情、设备表单。

**子组件**：

| 组件 | 文件 | 说明 |
|------|------|------|
| `DeviceTreePanel` | `DeviceTreePanel.vue` | 设备树形结构面板 |
| `DeviceDetailPanel` | `DeviceDetailPanel.vue` | 设备详情面板 |
| `EmptyState` | `EmptyState.vue` | 空状态提示 |

**表单页面**：
- `DeviceForm.vue` - 设备表单（新增/编辑）
- `StationForm.vue` - 站点表单
- `SolarInverterForm.vue` - 光伏逆变器表单
- `SolarModuleForm.vue` - 光伏组件表单
- `SolarStationForm.vue` - 光伏站点表单

**核心文件**：

| 文件 | 说明 |
|------|------|
| `types.ts` | 设备相关类型定义 |
| `mockDeviceTree.ts` | Mock 设备树数据 |
| `deviceRepository.ts` | 设备数据仓库 |
| `deviceAdapters.ts` | 数据适配器 |
| `useDeviceManager.ts` | 设备管理逻辑 Composable |
| `useDeviceRealtimeSync.ts` | 设备实时同步 Composable |

### 8.2 光伏模块

| 页面 | 路由 | 说明 |
|------|------|------|
| 实时监控 | `/solar/monitor` | 光伏系统实时监控 |
| 计量与能效 | `/solar/metering` | 光伏发电计量与能效分析 |
| 设备管理 | `/solar/device` | 光伏设备管理 |
| 运维管理 | `/solar/maintenance` | 光伏运维工单管理 |

### 8.3 其他业务模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 充电桩 | `/charging-station` | 充电桩监控与管理 |
| 工商业负荷 | `/commercial-load` | 工商业负荷监控与预测 |
| 告警中心 | `/alarm-center` | 全局告警管理（确认/清除/规则） |
| 登录日志 | `/login-log` | 登录日志查看与导出（仅 admin） |

---

## 9. 类型定义

### 9.1 通用类型 (`types/common.ts`)

| 接口 | 说明 |
|------|------|
| `PaginatedResponse<T>` | 分页响应结构（`list`, `total`, `page`, `pageSize`） |
| `SelectOption` | 下拉选项（`label`, `value`） |
| `TableSort` | 表格排序（`prop`, `order`） |
| `DateRange` | 时间范围（`startDate`, `endDate`） |

### 9.2 API 类型 (`api/api.ts`)

| 接口 | 说明 |
|------|------|
| `PageParams` | 分页查询参数 |
| `PaginatedResponse<T>` | API 层分页响应 |
| `ApiResponse<T>` | 后端统一响应结构（`code`, `data`, `msg`） |
| `LoginCredentials` | 登录凭证（`username`, `password`） |
| `UserInfo` | 用户信息（`id`, `name`, `avatar`, `role`） |
| `UserQueryParams` | 用户查询参数 |

### 9.3 Store 类型

#### `stores/user.ts`

| 接口 | 说明 |
|------|------|
| `UserInfo` | 用户基本信息（`name`, `avatar`, `role`） |

#### `stores/energyStorage.ts`

引用自 `views/energy-storage/monitor/types.ts`：
- `EnergyGroupItem`
- `EnergyBlockItem`
- `MeterRow`
- `TopologyGroup` / `TopologyBlock`
- `RealtimeChartSeries`
- `MonitorRealtimePayload`

---

## 10. 环境变量

项目通过 `.env` 或 `.env.local` 文件配置环境变量（Vite 要求以 `VITE_` 开头）。

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | REST API 基础地址 |
| `VITE_WS_URL` | `ws://mock-local/energy-storage` | WebSocket 地址（含 `mock` 则启用 Mock） |
| `VITE_API_MOCK` | - | 是否启用 API Mock 模式（`true`/`false`） |
| `VITE_API_TARGET` | `http://localhost:8080` | 开发代理目标地址 |

**环境判断逻辑**（`utils/env.ts`）：

```typescript
export const isApiMockMode = import.meta.env.VITE_API_MOCK === 'true'
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
export const wsUrl = import.meta.env.VITE_WS_URL || 'ws://mock-local/energy-storage'
export const isProduction = import.meta.env.PROD
```

---

## 11. 测试架构

### 11.1 单元测试 (Vitest)

**配置文件**：`vitest.config.ts`

**环境**：`jsdom`

**全局变量**：启用

**Setup 文件**：`tests/setup.ts`
- Mock `localStorage`
- Mock `window` 尺寸
- Mock 事件监听

**覆盖率配置**：
- Provider：`v8`
- 输出格式：`text/json/html`
- 包含文件：`src/**/*.{ts,vue}`

**现有测试**：

| 测试文件 | 测试内容 |
|----------|----------|
| `tests/unit/usePagination.test.ts` | 分页逻辑测试 |
| `tests/unit/useAsyncState.test.ts` | 异步状态测试 |

### 11.2 E2E 测试 (Playwright)

**配置文件**：`playwright.config.ts`

**测试目录**：`tests/e2e/`

**基础地址**：`http://localhost:3000`

**支持浏览器**：Chromium、Firefox

**自动启动开发服务器**：`npm run dev`

**当前状态**：`tests/e2e/` 目录为空，待后续补充关键业务场景用例。

---

## 12. 代码规范

### 12.1 Vue 组件规范

- 统一使用 **Composition API** + **`<script setup lang="ts">`** 语法
- 组件导入使用 `@/` 路径别名指向 `src/`
- 模板中使用中文，注释使用中文
- 复杂样式使用 `<style scoped>`，通用布局优先使用 Tailwind 工具类

### 12.2 命名约定

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `Dashboard.vue`, `AppLayout.vue` |
| 目录名 | kebab-case | `energy-storage/`, `alarm-center/` |
| 变量/函数 | camelCase | `userData`, `fetchData()` |
| 类型/接口 | PascalCase | `UserInfo`, `ApiResponse` |
| Composable 文件 | `useXxx.ts` | `usePagination.ts` |

### 12.3 注释规范

**所有函数/方法必须编写 JSDoc 注释**：

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

**变量定义必须编写注释**：

```typescript
/** 搜索关键词 */
const searchKeyword = ref('')
/** 已选中的生命周期状态筛选项 key 列表 */
const selectedStatuses = ref<string[]>(statusFilters.map((item) => item.key))
/** 心跳间隔（毫秒） */
const HEARTBEAT_INTERVAL = 30000
```

### 12.4 ESLint 配置

**文件**：`eslint.config.js`

| 规则 | 配置 |
|------|------|
| `@typescript-eslint/no-explicit-any` | `warn` |
| `@typescript-eslint/no-unused-vars` | `warn`（下划线前缀忽略） |
| `vue/multi-word-component-names` | 关闭 |
| `no-console` | 关闭 |
| `no-debugger` | `warn` |

忽略目录：`dist/`, `node_modules/`, `*.cjs`

### 12.5 Prettier 配置

**文件**：`.prettierrc`

| 选项 | 值 |
|------|-----|
| `semi` | `false` |
| `singleQuote` | `true` |
| `trailingComma` | `"none"` |
| `printWidth` | `140` |

---

## 13. 安全注意事项

### 13.1 认证机制

- **当前为 Mock 实现**：`userStore.login()` 仅校验内置账号库，生成假 token 写入 `localStorage`
- **接入真实后端时需替换**：
  - 使用 HTTPS 传输敏感信息
  - 实现 token 过期与刷新机制
  - 妥善处理 `stores/user.ts` 中的登录逻辑

### 13.2 已预留的安全措施

- `api.ts` 中已预留 `Authorization` 请求拦截器
- 响应拦截器已实现 401 自动跳转登录页
- 构建产物 `dist/` 部署时建议配置 Nginx 反向代理并开启 HTTPS

### 13.3 Mock 账号（仅开发环境）

| 用户名 | 密码 | 角色 |
|--------|------|------|
| `admin` | `admin123` | `admin` |
| `operator` | `operator123` | `operator` |
| `viewer` | `viewer123` | `viewer` |
| `engineer` | `engineer123` | `engineer` |

---

## 14. 开发指南

### 14.1 快速开始

#### 环境要求

- Node.js >= 18
- npm >= 9

#### 安装依赖

```bash
npm install
```

#### 启动开发服务器

```bash
npm run dev
```

开发服务器默认运行在 `http://localhost:3000`，监听 `0.0.0.0`，允许任意 host 访问。

#### 访问应用

1. 浏览器打开 `http://localhost:3000`
2. 使用 Mock 账号登录（如 `admin` / `admin123`）
3. 默认启用 Mock 模式，无需真实后端即可体验全部功能

### 14.2 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建（类型检查 + 构建） |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | 代码检查 |
| `npm run lint:fix` | 代码检查并自动修复 |
| `npm run format` | 代码格式化 |
| `npx vitest` | 运行单元测试 |
| `npx vitest --coverage` | 运行测试并生成覆盖率报告 |
| `npx playwright test` | 运行 E2E 测试 |

### 14.3 新增页面指南

#### 步骤 1：创建页面组件

在 `src/views/` 下对应模块目录创建页面组件：

```
src/views/
└── your-module/
    └── YourPage.vue
```

#### 步骤 2：配置路由

在 `src/router/index.ts` 中添加路由配置：

```typescript
{
  path: 'your-module/your-page',
  name: 'YourPage',
  component: () => import('@/views/your-module/YourPage.vue'),
  meta: { title: '你的页面标题', menu: 'your-module' }
}
```

#### 步骤 3：添加菜单项（如需）

在 `src/components/layout/AppSidebar.vue` 的 `allMenuGroups` 中添加菜单项：

```typescript
{ title: '页面名称', path: '/your-module/your-page', icon: SomeIcon }
```

#### 步骤 4：编写页面逻辑

- 使用 `useAsyncState` 管理异步数据加载状态
- 使用 `useRealtimeChannel` 订阅实时数据
- 使用 `usePagination` 处理列表分页
- 使用通用组件（`CardPanel`, `AsyncPanel` 等）构建页面布局

### 14.4 接入真实后端

#### 步骤 1：创建 `.env.local`

```env
VITE_API_MOCK=false
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_WS_URL=wss://your-ws-domain.com/ws
```

#### 步骤 2：调整 API 接口

根据后端实际接口规范，调整 `src/api/api.ts` 中的接口路径和参数。

#### 步骤 3：替换登录逻辑

将 `stores/user.ts` 中的 Mock 登录逻辑替换为真实后端调用：

```typescript
// 联调模式已自动调用 authApi.login()
// 确保后端返回正确的 token 和用户信息结构
```

#### 步骤 4：处理 CORS

确保后端配置了正确的 CORS 头，或开发时使用 Vite 代理：

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': { target: 'https://your-api-domain.com', changeOrigin: true },
    '/ws': { target: 'https://your-ws-domain.com', changeOrigin: true, ws: true }
  }
}
```

---

## 15. 依赖关系图

### 15.1 模块依赖关系

```
                        ┌─────────────┐
                        │   main.ts   │
                        └──────┬──────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
         ┌──────▼──────┐ ┌────▼────┐  ┌──────▼──────┐
         │   App.vue   │ │ router/ │  │  stores/    │
         └─────────────┘ └────┬────┘  └──────┬──────┘
                              │              │
                 ┌────────────┼────────┐     │
                 │            │        │     │
          ┌──────▼──────┐ ┌──▼────┐ ┌▼─────▼──┐
          │ components/ │ │views/ │ │  api/   │
          └─────────────┘ └───┬───┘ └────┬────┘
                              │          │
                    ┌─────────┼────┐     │
                    │         │    │     │
             ┌──────▼──┐ ┌───▼──┐ │ ┌───▼──────────┐
             │energy-  │ │solar/│ │ │   gateway/   │
             │storage/ │ │      │ │ │(RealtimeData │
             └─────────┘ └──────┘ │ │  Gateway)    │
                                  │ └──────────────┘
                                  │
                           ┌──────▼──────┐
                           │  mocks/     │
                           │(Mock WS +   │
                           │ DataStream) │
                           └─────────────┘
```

### 15.2 实时数据流依赖

```
┌───────────────────────────────────────────────────────────────────────┐
│                           实时数据流                                  │
│                                                                       │
│  MockWebSocketServer ──定时推送──▶ MockWebSocket ─────────────────┐    │
│                                     (或真实WS)                     │    │
│                                          │                         │    │
│                                          ▼                         │    │
│                              RealtimeDataGateway                   │    │
│                              ┌─────────────────┐                   │    │
│                              │  subscribers Map │                   │    │
│                              │ (channel -> Set) │                   │    │
│                              └────────┬────────┘                   │    │
│                                       │                             │    │
│                    ┌──────────────────┼──────────────────┐          │    │
│                    │                  │                  │          │    │
│                    ▼                  ▼                  ▼          │    │
│          energyStorage.ts    useRealtimeChannel    其他组件直接订阅  │    │
│          (Store级引用计数)    (组件级生命周期)                       │    │
│                    │                  │                  │          │    │
│                    ▼                  ▼                  ▼          │    │
│              Dashboard.vue      Monitor.vue        其他页面组件      │    │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### 15.3 技术栈依赖关系

```
Vue 3.4.21
├── Composition API
├── <script setup>
└── 响应式系统 (ref, computed, reactive)
    │
    ├── Vue Router 4.3.0 ──── 路由管理
    │
    ├── Pinia 2.1.7 ───────── 状态管理
    │   ├── stores/user.ts
    │   └── stores/energyStorage.ts
    │
    ├── Element Plus 2.6.1 ── UI 组件
    │
    ├── ECharts 5.5.0 ─────── 图表渲染
    │   └── vue-echarts 6.6.9
    │
    ├── Tailwind CSS 3.4.17 ─ 样式系统
    │   ├── tailwindcss-animate
    │   └── tailwind-merge
    │
    ├── axios 1.6.8 ───────── HTTP 请求
    │   └── api/api.ts
    │
    └── Three.js 0.184.0 ──── 3D 渲染
```
