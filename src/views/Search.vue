<template>
  <div class="search-page">
    <!-- 搜索框 -->
    <el-card shadow="never" class="search-card">
      <el-input
        v-model="searchKeyword"
        placeholder="输入基金代码或名称搜索（如：000001、华夏）"
        size="large"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button :icon="Search" @click="handleSearch" :loading="searching">
            搜索
          </el-button>
        </template>
      </el-input>
      <div class="search-tips">
        <el-switch v-model="useRealApi" active-text="真实API" inactive-text="模拟数据" />
        <span class="tip-text">热门基金：000001、000011、110022、161725</span>
      </div>
    </el-card>

    <!-- 搜索结果 -->
    <el-card v-if="searchResults.length > 0" shadow="never" class="results-card">
      <template #header>
        <span>搜索结果 ({{ searchResults.length }})</span>
      </template>
      <el-table :data="searchResults" style="width: 100%" @row-click="showFundDetail">
        <el-table-column prop="code" label="基金代码" width="100" />
        <el-table-column prop="name" label="基金名称" min-width="200" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column label="净值" width="100">
          <template #default="{ row }">
            {{ row.currentNetValue?.toFixed(4) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="涨跌幅" width="100">
          <template #default="{ row }">
            <span :class="row.dailyChange >= 0 ? 'profit-up' : 'profit-down'">
              {{ row.dailyChange >= 0 ? '+' : '' }}{{ (row.dailyChange * 100).toFixed(2) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click.stop="showFundDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="!watchlistStore.isInWatchlist(row.code)"
              type="warning"
              size="small"
              plain
              @click.stop="addToWatchlist(row)"
            >
              自选
            </el-button>
            <el-button
              v-else
              type="info"
              size="small"
              plain
              disabled
            >
              已加
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 无结果提示 -->
    <el-card v-if="searched && searchResults.length === 0" shadow="never" class="results-card">
      <el-empty description="未找到相关基金">
        <el-button type="primary" @click="useRealApi = false; handleSearch()">
          使用模拟数据搜索
        </el-button>
      </el-empty>
    </el-card>

    <!-- 基金详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      :title="currentFund?.name"
      width="650px"
      destroy-on-close
    >
      <div v-if="currentFund" class="fund-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="基金代码">{{ currentFund.code }}</el-descriptions-item>
          <el-descriptions-item label="基金类型">{{ currentFund.type }}</el-descriptions-item>
          <el-descriptions-item label="当前净值">
            <span :class="{ 'profit-up': currentFund.dailyChange >= 0, 'profit-down': currentFund.dailyChange < 0 }">
              {{ currentFund.currentNetValue?.toFixed(4) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="日涨跌幅">
            <span :class="{ 'profit-up': currentFund.dailyChange >= 0, 'profit-down': currentFund.dailyChange < 0 }">
              {{ currentFund.dailyChange >= 0 ? '+' : '' }}{{ (currentFund.dailyChange * 100).toFixed(2) }}%
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="净值日期" :span="2">{{ currentFund.netValueDate }}</el-descriptions-item>
        </el-descriptions>

        <div class="chart-container">
          <div class="chart-header">
            <h4>历史净值走势</h4>
            <el-radio-group v-model="chartPeriod" size="small">
              <el-radio-button label="30">近1月</el-radio-button>
              <el-radio-button label="60">近2月</el-radio-button>
              <el-radio-button label="90">近3月</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="chartRef" style="height: 320px;"></div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="addToPosition">添加到持仓</el-button>
      </template>
    </el-dialog>

    <!-- 添加持仓弹窗 -->
    <el-dialog v-model="addPositionVisible" title="添加持仓" width="500px">
      <el-form :model="positionForm" label-width="100px">
        <el-form-item label="基金代码">
          <el-input v-model="positionForm.fundCode" disabled />
        </el-form-item>
        <el-form-item label="基金名称">
          <el-input v-model="positionForm.fundName" disabled />
        </el-form-item>
        <el-form-item label="买入日期" required>
          <el-date-picker
            v-model="positionForm.buyDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="买入净值" required>
          <el-input-number v-model="positionForm.buyNetValue" :precision="4" :min="0" :step="0.001" style="width: 100%" />
        </el-form-item>
        <el-form-item label="买入金额" required>
          <el-input-number v-model="positionForm.amount" :precision="2" :min="0" :step="100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="份额">
          <el-input-number v-model="positionForm.shares" :precision="2" :min="0" style="width: 100%" disabled />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="positionForm.remark" type="textarea" placeholder="可选备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addPositionVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddPosition">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getFundInfo, getFundHistory, searchFunds } from '@/api/fund'
import { usePositionStore } from '@/stores/position'
import { useWatchlistStore } from '@/stores/watchlist'
import type { Fund, NetValueHistory } from '@/types'

const route = useRoute()
const positionStore = usePositionStore()
const watchlistStore = useWatchlistStore()

const searchKeyword = ref('')
const searching = ref(false)
const searched = ref(false)
const searchResults = ref<Fund[]>([])
const useRealApi = ref(true)

const detailVisible = ref(false)
const addPositionVisible = ref(false)
const currentFund = ref<Fund | null>(null)
const historyData = ref<NetValueHistory[]>([])
const chartRef = ref<HTMLElement>()
const chartPeriod = ref(60)

const positionForm = ref({
  fundCode: '',
  fundName: '',
  buyDate: '',
  buyNetValue: 0,
  amount: 1000,
  shares: 0,
  remark: ''
})

// 计算份额
watch(() => [positionForm.value.amount, positionForm.value.buyNetValue], () => {
  if (positionForm.value.buyNetValue > 0) {
    positionForm.value.shares = positionForm.value.amount / positionForm.value.buyNetValue
  }
})

// 图表周期变化时重新加载
watch(chartPeriod, async () => {
  if (currentFund.value && detailVisible.value) {
    historyData.value = await getFundHistory(currentFund.value.code, useRealApi.value, 1, chartPeriod.value)
    await nextTick()
    renderChart()
  }
})

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  searching.value = true
  searched.value = false
  try {
    const keyword = searchKeyword.value.trim()

    // 如果是纯数字，当作基金代码查询
    if (/^\d+$/.test(keyword)) {
      const fund = await getFundInfo(keyword, useRealApi.value)
      if (fund) {
        searchResults.value = [fund]
      } else {
        searchResults.value = []
      }
    } else {
      // 否则使用搜索（暂时用模拟数据）
      searchResults.value = [getMockFundByName(keyword)]
    }

    searched.value = true
  } catch (e) {
    ElMessage.error('搜索失败，请重试')
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

// 页面加载时自动搜索（从顶部搜索框跳转）
onMounted(() => {
  const keyword = route.query.keyword as string
  if (keyword) {
    searchKeyword.value = keyword
    handleSearch()
  }
})

// 模拟按名称搜索
function getMockFundByName(keyword: string): Fund {
  const mockFunds: Fund[] = [
    { code: '000001', name: '华夏成长混合', type: '混合型', currentNetValue: 1.2340, dailyChange: 0.0234, netValueDate: '2026-03-29' },
    { code: '000011', name: '华夏大盘精选', type: '混合型', currentNetValue: 3.8920, dailyChange: 0.0156, netValueDate: '2026-03-29' },
    { code: '110022', name: '易方达消费行业', type: '股票型', currentNetValue: 5.4320, dailyChange: 0.0345, netValueDate: '2026-03-29' },
    { code: '161725', name: '招商中证白酒指数', type: '指数型', currentNetValue: 1.2345, dailyChange: 0.0289, netValueDate: '2026-03-29' },
    { code: '260108', name: '景顺长城新兴成长', type: '混合型', currentNetValue: 2.8760, dailyChange: -0.0087, netValueDate: '2026-03-29' }
  ]

  const found = mockFunds.find(f => f.name.includes(keyword) || f.code.includes(keyword))
  return found || {
    code: '000000',
    name: `搜索: ${keyword}`,
    type: '混合型',
    currentNetValue: 1.5 + Math.random(),
    dailyChange: (Math.random() - 0.5) * 0.1,
    netValueDate: new Date().toISOString().split('T')[0]
  }
}

const showFundDetail = async (fund: Fund) => {
  currentFund.value = fund
  detailVisible.value = true

  // 获取历史数据
  historyData.value = await getFundHistory(fund.code, useRealApi.value, 1, chartPeriod.value)

  // 渲染图表
  await nextTick()
  renderChart()
}

const renderChart = () => {
  if (!chartRef.value) return

  const chart = echarts.init(chartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0]
        return `${data.axisValue}<br/>净值: ${data.value?.toFixed(4)}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: historyData.value.map(h => h.date),
      axisLabel: {
        interval: Math.floor(historyData.value.length / 6),
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: {
        formatter: (value: number) => value.toFixed(2)
      }
    },
    series: [
      {
        name: '净值',
        type: 'line',
        data: historyData.value.map(h => h.netValue),
        smooth: true,
        symbol: 'none',
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        lineStyle: {
          color: '#409eff',
          width: 2
        }
      }
    ]
  }

  chart.setOption(option)
}

const addToPosition = () => {
  if (!currentFund.value) return

  positionForm.value = {
    fundCode: currentFund.value.code,
    fundName: currentFund.value.name,
    buyDate: new Date().toISOString().split('T')[0],
    buyNetValue: currentFund.value.currentNetValue,
    amount: 1000,
    shares: 0,
    remark: ''
  }

  detailVisible.value = false
  addPositionVisible.value = true
}

const confirmAddPosition = () => {
  if (!positionForm.value.buyDate) {
    ElMessage.warning('请选择买入日期')
    return
  }
  if (positionForm.value.amount <= 0) {
    ElMessage.warning('请输入买入金额')
    return
  }

  positionStore.addPosition({
    fundCode: positionForm.value.fundCode,
    fundName: positionForm.value.fundName,
    buyDate: positionForm.value.buyDate,
    buyNetValue: positionForm.value.buyNetValue,
    shares: positionForm.value.shares,
    amount: positionForm.value.amount,
    remark: positionForm.value.remark
  })

  // 缓存基金信息
  if (currentFund.value) {
    positionStore.cacheFund(currentFund.value)
  }

  ElMessage.success('添加成功')
  addPositionVisible.value = false
}

// 添加到自选
const addToWatchlist = (fund: Fund) => {
  const result = watchlistStore.addToWatchlist({
    fundCode: fund.code,
    fundName: fund.name,
    fundType: fund.type
  })

  if (result) {
    ElMessage.success('已加入自选')
  } else {
    ElMessage.info('该基金已在自选中')
  }
}
</script>

<style scoped>
.search-page {
  max-width: 1000px;
  margin: 0 auto;
}

.search-card {
  margin-bottom: 20px;
}

.search-tips {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}

.tip-text {
  color: #909399;
  font-size: 13px;
}

.results-card {
  margin-bottom: 20px;
}

.fund-detail h4 {
  margin: 0;
  color: #303133;
}

.chart-container {
  margin-top: 20px;
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.profit-up {
  color: #f56c6c;
  font-weight: bold;
}

.profit-down {
  color: #67c23a;
  font-weight: bold;
}

@media (max-width: 768px) {
  .search-tips {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
