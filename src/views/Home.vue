<template>
  <div class="home-page">
    <!-- 大盘指数看板 -->
    <el-card class="market-index-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><TrendCharts /></el-icon>
            大盘指数
          </span>
          <div class="header-right">
            <el-switch v-model="useRealApi" size="small" active-text="实时" inactive-text="模拟" @change="loadMarketIndexes" />
            <el-button :icon="Refresh" size="small" text @click="loadMarketIndexes" :loading="loadingIndexes">
              刷新
            </el-button>
          </div>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6" v-for="index in marketIndexes" :key="index.code">
          <div class="index-item" :class="{ 'is-up': index.changePercent >= 0, 'is-down': index.changePercent < 0 }">
            <div class="index-name">{{ index.name }}</div>
            <div class="index-price">{{ index.price.toFixed(2) }}</div>
            <div class="index-change">
              <span>{{ index.change >= 0 ? '+' : '' }}{{ index.change.toFixed(2) }}</span>
              <span class="change-percent">{{ index.changePercent >= 0 ? '+' : '' }}{{ index.changePercent.toFixed(2) }}%</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #409eff;">
            <el-icon :size="28"><Wallet /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ positionStore.positionCount }}</div>
            <div class="stat-label">持仓数量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #67c23a;">
            <el-icon :size="28"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatMoney(totalCost) }}</div>
            <div class="stat-label">总投入</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" :style="{ background: totalProfit >= 0 ? '#67c23a' : '#f56c6c' }">
            <el-icon :size="28"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value" :class="{ 'profit-up': totalProfit >= 0, 'profit-down': totalProfit < 0 }">
              {{ totalProfit >= 0 ? '+' : '' }}{{ formatMoney(totalProfit) }}
            </div>
            <div class="stat-label">总收益</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" :style="{ background: totalProfitRate >= 0 ? '#67c23a' : '#f56c6c' }">
            <el-icon :size="28"><DataAnalysis /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value" :class="{ 'profit-up': totalProfitRate >= 0, 'profit-down': totalProfitRate < 0 }">
              {{ totalProfitRate >= 0 ? '+' : '' }}{{ formatPercent(totalProfitRate) }}
            </div>
            <div class="stat-label">收益率</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card class="quick-actions" shadow="never">
      <template #header>
        <span>快捷操作</span>
      </template>
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6">
          <el-button type="primary" @click="$router.push('/search')" class="action-btn">
            <el-icon><Search /></el-icon>
            <span>查询基金</span>
          </el-button>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-button type="success" @click="$router.push('/positions')" class="action-btn">
            <el-icon><Plus /></el-icon>
            <span>添加持仓</span>
          </el-button>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-button type="warning" @click="$router.push('/calculator')" class="action-btn">
            <el-icon><Calendar /></el-icon>
            <span>收益计算</span>
          </el-button>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-button type="info" @click="$router.push('/analysis')" class="action-btn">
            <el-icon><PieChart /></el-icon>
            <span>数据分析</span>
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 持仓列表 -->
    <el-card class="position-list" shadow="never">
      <template #header>
        <div class="card-header">
          <span>我的持仓</span>
          <el-button type="primary" text @click="$router.push('/positions')">
            查看全部
          </el-button>
        </div>
      </template>

      <el-empty v-if="positionStore.positions.length === 0" description="暂无持仓记录">
        <el-button type="primary" @click="$router.push('/positions')">
          添加持仓
        </el-button>
      </el-empty>

      <el-table v-else :data="positionStore.positions.slice(0, 5)" style="width: 100%">
        <el-table-column prop="fundCode" label="基金代码" width="100" />
        <el-table-column prop="fundName" label="基金名称" min-width="150" />
        <el-table-column label="买入金额" width="120">
          <template #default="{ row }">
            {{ formatMoney(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column label="买入净值" width="100">
          <template #default="{ row }">
            {{ row.buyNetValue.toFixed(4) }}
          </template>
        </el-table-column>
        <el-table-column prop="buyDate" label="买入日期" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { usePositionStore } from '@/stores/position'
import { formatMoney as fmtMoney, formatPercent as fmtPercent } from '@/utils/calculator'
import { getMarketIndexes, type MarketIndex } from '@/api/fund'

const positionStore = usePositionStore()

// 大盘指数
const marketIndexes = ref<MarketIndex[]>([])
const loadingIndexes = ref(false)
const useRealApi = ref(true)
let refreshTimer: ReturnType<typeof setInterval> | null = null

const loadMarketIndexes = async () => {
  loadingIndexes.value = true
  try {
    marketIndexes.value = await getMarketIndexes(useRealApi.value)
  } finally {
    loadingIndexes.value = false
  }
}

// 自动刷新（每60秒）
const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    loadMarketIndexes()
  }, 60000)
}

onMounted(() => {
  loadMarketIndexes()
  startAutoRefresh()
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

const totalCost = computed(() => positionStore.totalCost)

// 模拟总市值计算
const totalValue = computed(() => {
  // 简化计算：假设平均收益率为5%
  return positionStore.totalCost * 1.05
})

const totalProfit = computed(() => totalValue.value - totalCost.value)

const totalProfitRate = computed(() => {
  if (totalCost.value === 0) return 0
  return totalProfit.value / totalCost.value
})

const formatMoney = (value: number) => fmtMoney(value)
const formatPercent = (value: number) => fmtPercent(value)
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* 大盘指数样式 */
.market-index-card {
  margin-bottom: 20px;
}

.market-index-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.market-index-card .card-header span {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.index-item {
  padding: 16px;
  border-radius: 8px;
  background: #f5f7fa;
  text-align: center;
  transition: all 0.3s;
}

.index-item.is-up {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
}

.index-item.is-down {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
}

.index-name {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.index-price {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.is-up .index-price {
  color: #f56c6c;
}

.is-down .index-price {
  color: #67c23a;
}

.index-change {
  font-size: 13px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.is-up .index-change {
  color: #f56c6c;
}

.is-down .index-change {
  color: #67c23a;
}

.change-percent {
  font-weight: 500;
}

/* 统计卡片样式 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 16px;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.profit-up {
  color: #f56c6c !important;
}

.profit-down {
  color: #67c23a !important;
}

.quick-actions {
  margin-bottom: 20px;
}

.action-btn {
  width: 100%;
  height: 60px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-btn span {
  font-size: 14px;
}

.position-list .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .index-item {
    margin-bottom: 12px;
  }

  .index-price {
    font-size: 20px;
  }

  .stat-card {
    margin-bottom: 12px;
  }

  .stat-value {
    font-size: 18px;
  }

  .action-btn {
    height: 50px;
    margin-bottom: 8px;
  }

  .header-right {
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
}
</style>
