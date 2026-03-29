<template>
  <div class="watchlist-page">
    <!-- 搜索框 -->
    <el-card shadow="never" class="search-card">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入代码/名称/首字母"
        size="large"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </el-card>

    <!-- 分类标签 -->
    <el-card shadow="never" class="filter-card">
      <el-radio-group v-model="filterType" size="small">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="recent">最近</el-radio-button>
        <el-radio-button label="holding">持有</el-radio-button>
      </el-radio-group>
      <el-button
        :icon="Refresh"
        size="small"
        text
        @click="refreshData"
        :loading="loading"
        style="margin-left: auto;"
      >
        刷新
      </el-button>
    </el-card>

    <!-- 自选列表 -->
    <el-card shadow="never" class="list-card">
      <el-empty v-if="filteredWatchlist.length === 0" description="暂无自选基金">
        <el-button type="primary" @click="$router.push('/search')">
          去添加
        </el-button>
      </el-empty>

      <el-table v-else :data="filteredWatchlist" style="width: 100%">
        <!-- 产品名称+代码 -->
        <el-table-column label="产品名称" min-width="200">
          <template #default="{ row }">
            <div class="fund-info">
              <div class="fund-name">
                {{ row.fundName }}
                <el-tag v-if="isHolding(row.fundCode)" size="small" type="info" class="holding-tag">
                  持有
                </el-tag>
              </div>
              <div class="fund-code">{{ row.fundCode }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 涨跌幅 -->
        <el-table-column label="涨跌幅" width="120">
          <template #default="{ row }">
            <div v-if="fundPrices[row.fundCode]" :class="fundPrices[row.fundCode].changePercent >= 0 ? 'profit-up' : 'profit-down'">
              <div class="change-percent">
                {{ fundPrices[row.fundCode].changePercent >= 0 ? '+' : '' }}{{ fundPrices[row.fundCode].changePercent.toFixed(2) }}%
              </div>
            </div>
            <div v-else class="loading-text">加载中...</div>
          </template>
        </el-table-column>

        <!-- 关联板块 -->
        <el-table-column label="关联板块" width="120">
          <template #default="{ row }">
            <span class="fund-type">{{ row.fundType }}</span>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              text
              @click="handleRemove(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useWatchlistStore } from '@/stores/watchlist'
import { usePositionStore } from '@/stores/position'
import { getFundInfo } from '@/api/fund'
import type { WatchlistItem } from '@/types'

const watchlistStore = useWatchlistStore()
const positionStore = usePositionStore()

const searchKeyword = ref('')
const filterType = ref('all')
const loading = ref(false)

// 基金实时价格缓存
interface FundPrice {
  netValue: number
  changePercent: number
}
const fundPrices = ref<Record<string, FundPrice>>({})

// 判断是否持有
const isHolding = (code: string) => {
  return positionStore.positions.some(p => p.fundCode === code)
}

// 过滤后的自选列表
const filteredWatchlist = computed(() => {
  let list = [...watchlistStore.watchlist]

  // 搜索过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    list = list.filter(item =>
      item.fundCode.includes(keyword) ||
      item.fundName.toLowerCase().includes(keyword)
    )
  }

  // 分类过滤
  if (filterType.value === 'recent') {
    // 最近7天添加的
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    list = list.filter(item => new Date(item.addedAt) >= weekAgo)
  } else if (filterType.value === 'holding') {
    // 已持有的
    list = list.filter(item => isHolding(item.fundCode))
  }

  return list
})

// 加载基金实时数据
const loadFundPrices = async () => {
  loading.value = true
  try {
    const promises = watchlistStore.watchlist.map(async (item) => {
      try {
        const fund = await getFundInfo(item.fundCode, true)
        if (fund) {
          fundPrices.value[item.fundCode] = {
            netValue: fund.currentNetValue,
            changePercent: fund.dailyChange * 100
          }
        }
      } catch (e) {
        // 忽略单个加载失败
      }
    })
    await Promise.all(promises)
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  fundPrices.value = {}
  loadFundPrices()
}

// 搜索
const handleSearch = () => {
  // 触发filteredWatchlist重新计算
}

// 删除自选
const handleRemove = async (row: WatchlistItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${row.fundName} 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    watchlistStore.removeFromWatchlist(row.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  loadFundPrices()
})
</script>

<style scoped>
.watchlist-page {
  max-width: 1000px;
  margin: 0 auto;
}

.search-card {
  margin-bottom: 16px;
}

.filter-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  padding: 12px 16px;
}

.list-card {
  margin-top: 16px;
}

.fund-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fund-name {
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.fund-code {
  font-size: 12px;
  color: #909399;
}

.holding-tag {
  font-size: 11px;
  padding: 0 6px;
  height: 18px;
  line-height: 16px;
}

.change-percent {
  font-weight: bold;
  font-size: 15px;
}

.fund-type {
  font-size: 13px;
  color: #909399;
}

.loading-text {
  font-size: 12px;
  color: #909399;
}

.profit-up {
  color: #f56c6c;
}

.profit-down {
  color: #67c23a;
}

@media (max-width: 768px) {
  .fund-name {
    font-size: 14px;
  }

  .change-percent {
    font-size: 14px;
  }
}
</style>
