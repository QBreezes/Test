<template>
  <el-container class="layout-container">
    <!-- 移动端遮罩 -->
    <div
      v-if="isMobile && !isCollapse"
      class="mobile-mask"
      @click="isCollapse = true"
    />

    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" :class="{ 'is-mobile': isMobile, 'is-hidden': isMobile && isCollapse }">
      <div class="logo">
        <el-icon :size="28"><TrendCharts /></el-icon>
        <span v-show="!isCollapse">基金计算器</span>
      </div>
      <el-menu
        :default-active="currentRoute"
        :collapse="isCollapse"
        router
        class="sidebar-menu"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-button
            :icon="isCollapse ? Expand : Fold"
            @click="isCollapse = !isCollapse"
            text
          />
        </div>
        <div class="header-center">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索基金代码/名称"
            class="header-search"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="header-right">
          <span class="current-date">{{ currentDate }}</span>
        </div>
      </el-header>

      <!-- 大盘指数固定栏 -->
      <div class="market-bar">
        <div
          v-for="index in marketIndexes"
          :key="index.code"
          class="market-item"
          :class="{ 'is-up': index.changePercent >= 0, 'is-down': index.changePercent < 0 }"
        >
          <span class="market-name">{{ index.name }}</span>
          <span class="market-price">{{ index.price.toFixed(2) }}</span>
          <span class="market-change">
            {{ index.changePercent >= 0 ? '+' : '' }}{{ index.changePercent.toFixed(2) }}%
          </span>
        </div>
      </div>

      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Fold, Expand, Search } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { getMarketIndexes, type MarketIndex } from '@/api/fund'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const isMobile = ref(false)
const searchKeyword = ref('')

const currentDate = computed(() => dayjs().format('YYYY年MM月DD日'))

const currentRoute = computed(() => route.path)

const menuItems = [
  { path: '/home', title: '首页', icon: 'HomeFilled' },
  { path: '/positions', title: '持仓管理', icon: 'Wallet' },
  { path: '/watchlist', title: '自选', icon: 'Star' },
  { path: '/calculator', title: '收益计算', icon: 'Calendar' },
  { path: '/analysis', title: '数据分析', icon: 'DataAnalysis' },
  { path: '/settings', title: '设置', icon: 'Setting' }
]

// 大盘指数
const marketIndexes = ref<MarketIndex[]>([])
const loadingIndexes = ref(false)
let refreshTimer: ReturnType<typeof setInterval> | null = null

const loadMarketIndexes = async () => {
  loadingIndexes.value = true
  try {
    marketIndexes.value = await getMarketIndexes()
    console.log('大盘指数已更新:', marketIndexes.value)
  } catch (e) {
    console.error('加载大盘指数失败:', e)
  } finally {
    loadingIndexes.value = false
  }
}

// 判断是否在交易时间（工作日 9:30-11:30, 13:00-15:00）
const isTradingTime = () => {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  const minute = now.getMinutes()

  // 周末不是交易时间
  if (day === 0 || day === 6) return false

  const time = hour * 60 + minute
  // 9:30-11:30 = 570-690
  // 13:00-15:00 = 780-900
  return (time >= 570 && time <= 690) || (time >= 780 && time <= 900)
}

// 自动刷新（交易时间每3秒刷新）
const startAutoRefresh = () => {
  const doRefresh = () => {
    if (isTradingTime()) {
      loadMarketIndexes()
    }
  }

  // 立即加载一次
  loadMarketIndexes()

  // 每3秒检查是否需要刷新
  refreshTimer = setInterval(() => {
    doRefresh()
  }, 3000)
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/search',
      query: { keyword: searchKeyword.value.trim() }
    })
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    isCollapse.value = true
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  loadMarketIndexes()
  startAutoRefresh()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  border-bottom: 1px solid var(--el-border-color-light);
}

.sidebar-menu {
  border-right: none;
  height: calc(100% - 60px);
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 16px;
  gap: 16px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 400px;
  margin: 0 auto;
}

.header-search {
  width: 100%;
  max-width: 360px;
}

.header-right {
  color: #666;
  font-size: 14px;
  white-space: nowrap;
}

.layout-main {
  background: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}

/* 大盘指数栏 */
.market-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 8px 20px;
  background: #fff;
  border-bottom: 1px solid var(--el-border-color-light);
  font-size: 13px;
}

.market-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: default;
}

.market-item.is-up {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}

.market-item.is-down {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
}

.market-name {
  font-weight: 500;
}

.market-price {
  font-weight: bold;
  margin-left: 4px;
}

.market-change {
  font-size: 12px;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .el-aside {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    background: #fff;
    transition: transform 0.3s;
  }

  .el-aside.is-hidden {
    transform: translateX(-100%);
  }

  .mobile-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  .layout-main {
    padding: 12px;
  }

  .header-center {
    max-width: none;
    padding: 0 8px;
  }

  .header-right .current-date {
    display: none;
  }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
