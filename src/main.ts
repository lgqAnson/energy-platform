/**
 * 应用入口
 *
 * 创建 Vue 应用实例，依次注册 Pinia 状态管理、Vue Router 路由、
 * Element Plus UI 组件库以及 Font Awesome 图标组件。
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import App from './App.vue'
import router from './router'
import './assets/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
