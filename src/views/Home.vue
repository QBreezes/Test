<template>
  <div class="home-page">
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
import { computed } from 'vue'
import { usePositionStore } from '@/stores/position'
import { formatMoney as fmtMoney, formatPercent as fmtPercent } from '@/utils/calculator'

const positionStore = usePositionStore()

const totalCost = computed(() => positionStore.totalCost)

// 总市值计算
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
