<template>
  <div class="analysis-page">
    <el-row :gutter="20">
      <!-- 持仓分布饼图 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>持仓分布</span>
          </template>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 收益走势图 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>收益趋势（模拟）</span>
          </template>
          <div ref="lineChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 收益对比柱状图 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>各基金收益对比</span>
          </template>
          <div ref="barChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 详细数据表格 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>持仓明细</span>
          </template>
          <el-table :data="tableData" style="width: 100%" max-height="350">
            <el-table-column prop="name" label="基金名称" min-width="120" />
            <el-table-column prop="amount" label="投入金额" width="100">
              <template #default="{ row }">
                {{ formatMoney(row.amount) }}
              </template>
            </el-table-column>
            <el-table-column prop="rate" label="收益率" width="100">
              <template #default="{ row }">
                <span :class="row.rate >= 0 ? 'profit-up' : 'profit-down'">
                  {{ row.rate >= 0 ? '+' : '' }}{{ formatPercent(row.rate) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="profit" label="收益" width="100">
              <template #default="{ row }">
                <span :class="row.profit >= 0 ? 'profit-up' : 'profit-down'">
                  {{ row.profit >= 0 ? '+' : '' }}{{ formatMoney(row.profit) }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { usePositionStore } from '@/stores/position'
import { formatMoney as fmtMoney, formatPercent as fmtPercent } from '@/utils/calculator'

const positionStore = usePositionStore()

const pieChartRef = ref<HTMLElement>()
const lineChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()

// 表格数据
const tableData = computed(() => {
  return positionStore.positions.map(p => {
    const rate = (Math.random() - 0.5) * 0.2
    const profit = p.amount * rate
    return {
      name: p.fundName,
      amount: p.amount,
      rate,
      profit
    }
  })
})

const formatMoney = (value: number) => fmtMoney(value)
const formatPercent = (value: number) => fmtPercent(value)

const initCharts = () => {
  initPieChart()
  initLineChart()
  initBarChart()
}

const initPieChart = () => {
  if (!pieChartRef.value) return

  const chart = echarts.init(pieChartRef.value)

  // 按基金名称分组
  const groupedData: Record<string, number> = {}
  positionStore.positions.forEach(p => {
    if (groupedData[p.fundName]) {
      groupedData[p.fundName] += p.amount
    } else {
      groupedData[p.fundName] = p.amount
    }
  })

  const pieData = Object.entries(groupedData).map(([name, value]) => ({
    name,
    value
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: pieData.length > 0 ? pieData : [{ name: '暂无数据', value: 1 }]
      }
    ]
  }

  chart.setOption(option)
}

const initLineChart = () => {
  if (!lineChartRef.value) return

  const chart = echarts.init(lineChartRef.value)

  // 模拟过去30天的收益趋势
  const dates: string[] = []
  const profits: number[] = []
  let cumulativeProfit = 0

  for (let i = 30; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }))
    cumulativeProfit += (Math.random() - 0.4) * 100
    profits.push(cumulativeProfit)
  }

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        interval: 5
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '累计收益',
        type: 'line',
        data: profits,
        smooth: true,
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.5)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
          ])
        },
        lineStyle: {
          color: '#67c23a'
        }
      }
    ]
  }

  chart.setOption(option)
}

const initBarChart = () => {
  if (!barChartRef.value) return

  const chart = echarts.init(barChartRef.value)

  const names = tableData.value.map(d => d.name)
  const profits = tableData.value.map(d => d.profit)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: names.length > 0 ? names : ['暂无数据'],
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        type: 'bar',
        data: profits.length > 0 ? profits : [0],
        itemStyle: {
          color: (params: any) => {
            return params.value >= 0 ? '#67c23a' : '#f56c6c'
          }
        }
      }
    ]
  }

  chart.setOption(option)
}

onMounted(async () => {
  await nextTick()
  initCharts()

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    echarts.getInstanceByDom(pieChartRef.value!)?.resize()
    echarts.getInstanceByDom(lineChartRef.value!)?.resize()
    echarts.getInstanceByDom(barChartRef.value!)?.resize()
  })
})
</script>

<style scoped>
.analysis-page {
  max-width: 1400px;
  margin: 0 auto;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 350px;
}

.profit-up {
  color: #67c23a;
}

.profit-down {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .chart-container {
    height: 280px;
  }
}
</style>
