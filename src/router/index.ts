import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      {
        path: 'watchlist',
        name: 'Watchlist',
        component: () => import('@/views/Watchlist.vue'),
        meta: { title: '自选', icon: 'Star' }
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/views/Search.vue'),
        meta: { title: '基金查询', icon: 'Search' }
      },
      {
        path: 'positions',
        name: 'Positions',
        component: () => import('@/views/Positions.vue'),
        meta: { title: '持仓管理', icon: 'Wallet' }
      },
      {
        path: 'calculator',
        name: 'Calculator',
        component: () => import('@/views/Calculator.vue'),
        meta: { title: '收益计算', icon: 'Calendar' }
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: () => import('@/views/Analysis.vue'),
        meta: { title: '数据分析', icon: 'DataAnalysis' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: { title: '设置', icon: 'Setting' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
