import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Login from '@/views/login/Login.vue'
import AppLayout from '@/components/layout/AppLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true }
  },
  {
    path: '/',
    component: AppLayout,
    redirect: '/energy-storage/dashboard',
    children: [
      {
        path: 'energy-storage/dashboard',
        name: 'EnergyDashboard',
        component: () => import('@/views/energy-storage/dashboard/Dashboard.vue'),
        meta: { title: '储能-可视看板', menu: 'energy-storage' }
      },
      {
        path: 'energy-storage/monitor',
        name: 'EnergyMonitor',
        component: () => import('@/views/energy-storage/monitor/Monitor.vue'),
        meta: { title: '储能-实时监控', menu: 'energy-storage' }
      },
      {
        path: 'energy-storage/strategy',
        name: 'EnergyStrategy',
        component: () => import('@/views/energy-storage/strategy/Strategy.vue'),
        meta: { title: '储能-策略控制', menu: 'energy-storage' }
      },
      {
        path: 'energy-storage/price',
        name: 'EnergyPrice',
        component: () => import('@/views/energy-storage/price/Price.vue'),
        meta: { title: '储能-电价管理', menu: 'energy-storage' }
      },
      {
        path: 'energy-storage/settlement',
        name: 'EnergySettlement',
        component: () => import('@/views/energy-storage/settlement/Settlement.vue'),
        meta: { title: '储能-抄表结算', menu: 'energy-storage' }
      },
      {
        path: 'energy-storage/revenue',
        name: 'EnergyRevenue',
        component: () => import('@/views/energy-storage/revenue/Revenue.vue'),
        meta: { title: '储能-收益管理', menu: 'energy-storage' }
      },
      {
        path: 'energy-storage/maintenance',
        name: 'EnergyMaintenance',
        component: () => import('@/views/energy-storage/maintenance/Maintenance.vue'),
        meta: { title: '储能-运维管理', menu: 'energy-storage' }
      },
      {
        path: 'energy-storage/device',
        name: 'EnergyDevice',
        component: () => import('@/views/energy-storage/device/Device.vue'),
        meta: { title: '储能-设备管理', menu: 'energy-storage' }
      },
      {
        path: 'energy-storage/device/create',
        name: 'EnergyDeviceCreate',
        component: () => import('@/views/energy-storage/device/DeviceForm.vue')
      },
      {
        path: 'energy-storage/device/:id/edit',
        name: 'EnergyDeviceEdit',
        component: () => import('@/views/energy-storage/device/DeviceForm.vue')
      },
      {
        path: 'energy-storage/station/create',
        name: 'EnergyStationCreate',
        component: () => import('@/views/energy-storage/device/StationForm.vue')
      },
      {
        path: 'solar/monitor',
        name: 'SolarMonitor',
        component: () => import('@/views/solar/monitor/Monitor.vue'),
        meta: { title: '光伏-实时监控', menu: 'solar' }
      },
      {
        path: 'solar/metering',
        name: 'SolarMetering',
        component: () => import('@/views/solar/metering/Metering.vue'),
        meta: { title: '光伏-计量与能效', menu: 'solar' }
      },
      {
        path: 'solar/device',
        name: 'SolarDevice',
        component: () => import('@/views/solar/device/Device.vue'),
        meta: { title: '光伏-设备管理', menu: 'solar' }
      },
      {
        path: 'solar/maintenance',
        name: 'SolarMaintenance',
        component: () => import('@/views/solar/maintenance/Maintenance.vue'),
        meta: { title: '光伏-运维管理', menu: 'solar' }
      },
      {
        path: 'charging-station',
        name: 'ChargingStation',
        component: () => import('@/views/charging-station/ChargingStation.vue'),
        meta: { title: '充电桩', menu: 'charging' }
      },
      {
        path: 'commercial-load',
        name: 'CommercialLoad',
        component: () => import('@/views/commercial-load/CommercialLoad.vue'),
        meta: { title: '工商业负荷', menu: 'commercial' }
      },
      {
        path: 'alarm-center',
        name: 'AlarmCenter',
        component: () => import('@/views/alarm-center/AlarmCenter.vue'),
        meta: { title: '告警中心', menu: 'alarm' }
      },
      {
        path: 'login-log',
        name: 'LoginLog',
        component: () => import('@/views/system/login-log/LoginLog.vue'),
        meta: { title: '登录日志', menu: 'system' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  if (!to.meta.public && !userStore.token) {
    next('/login')
  } else {
    next()
  }
})

export default router
