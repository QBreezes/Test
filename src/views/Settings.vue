<template>
  <div class="settings-page">
    <el-card shadow="never" class="settings-card">
      <template #header>
        <span>系统设置</span>
      </template>

      <el-form label-width="120px">
        <el-form-item label="主题">
          <el-radio-group v-model="settings.theme" @change="saveSettings">
            <el-radio label="light">浅色</el-radio>
            <el-radio label="dark">深色（待实现）</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="语言">
          <el-select v-model="settings.language" @change="saveSettings">
            <el-option label="简体中文" value="zh-CN" />
            <el-option label="English" value="en-US" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="settings-card">
      <template #header>
        <span>数据管理</span>
      </template>

      <el-descriptions :column="1" border class="data-stats">
        <el-descriptions-item label="持仓数量">{{ positionStore.positionCount }}</el-descriptions-item>
        <el-descriptions-item label="总投入">{{ formatMoney(positionStore.totalCost) }}</el-descriptions-item>
        <el-descriptions-item label="缓存基金">{{ Object.keys(positionStore.fundCache).length }} 只</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">导出数据</el-divider>

      <div class="data-actions">
        <el-button type="primary" @click="exportJSON">
          <el-icon><Download /></el-icon>
          导出JSON备份
        </el-button>
        <el-button type="success" @click="exportCSV">
          <el-icon><Document /></el-icon>
          导出CSV表格
        </el-button>
      </div>

      <el-divider content-position="left">导入数据</el-divider>

      <div class="data-actions">
        <el-button @click="importJSON">
          <el-icon><Upload /></el-icon>
          导入JSON备份
        </el-button>
        <el-button @click="importCSV">
          <el-icon><Upload /></el-icon>
          导入CSV持仓
        </el-button>
      </div>

      <input
        ref="jsonInput"
        type="file"
        accept=".json"
        style="display: none"
        @change="handleJSONChange"
      />
      <input
        ref="csvInput"
        type="file"
        accept=".csv"
        style="display: none"
        @change="handleCSVChange"
      />

      <el-divider content-position="left">危险操作</el-divider>

      <div class="data-actions">
        <el-button type="danger" @click="clearData">
          <el-icon><Delete /></el-icon>
          清空所有数据
        </el-button>
      </div>
    </el-card>

    <el-card shadow="never" class="settings-card">
      <template #header>
        <span>CSV格式说明</span>
      </template>

      <div class="csv-help">
        <p>CSV文件格式要求：</p>
        <el-table :data="csvExample" size="small" border>
          <el-table-column prop="fundCode" label="基金代码" width="100" />
          <el-table-column prop="fundName" label="基金名称" width="150" />
          <el-table-column prop="buyDate" label="买入日期" width="120" />
          <el-table-column prop="buyNetValue" label="买入净值" width="100" />
          <el-table-column prop="shares" label="份额" width="100" />
          <el-table-column prop="amount" label="买入金额" width="100" />
          <el-table-column prop="remark" label="备注" />
        </el-table>
        <p class="tips">
          <el-icon><InfoFilled /></el-icon>
          第一行为标题行，从第二行开始为数据行。日期格式：YYYY-MM-DD
        </p>
      </div>
    </el-card>

    <el-card shadow="never" class="settings-card">
      <template #header>
        <span>关于</span>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="应用名称">基金估计计算器</el-descriptions-item>
        <el-descriptions-item label="版本">1.0.0</el-descriptions-item>
        <el-descriptions-item label="技术栈">Vue 3 + Vite + Element Plus</el-descriptions-item>
        <el-descriptions-item label="功能">
          基金查询、持仓管理、收益计算、数据分析
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePositionStore } from '@/stores/position'
import { formatMoney as fmtMoney } from '@/utils/calculator'
import {
  downloadPositionsCSV,
  downloadAllDataJSON,
  readFileContent,
  parsePositionsFromCSV,
  importAllData
} from '@/utils/export'

const positionStore = usePositionStore()
const jsonInput = ref<HTMLInputElement>()
const csvInput = ref<HTMLInputElement>()

const settings = reactive({
  theme: positionStore.settings.theme,
  language: positionStore.settings.language
})

// CSV示例数据
const csvExample = [
  {
    fundCode: '000001',
    fundName: '华夏成长混合',
    buyDate: '2026-01-15',
    buyNetValue: '1.2340',
    shares: '810.37',
    amount: '1000',
    remark: '定投'
  }
]

const formatMoney = (value: number) => fmtMoney(value)

const saveSettings = () => {
  positionStore.updateSettings(settings)
  ElMessage.success('设置已保存')
}

// 导出
const exportJSON = () => {
  downloadAllDataJSON()
  ElMessage.success('JSON备份已导出')
}

const exportCSV = () => {
  if (positionStore.positions.length === 0) {
    ElMessage.warning('暂无持仓数据')
    return
  }
  downloadPositionsCSV(positionStore.positions)
  ElMessage.success('CSV文件已导出')
}

// 导入
const importJSON = () => {
  jsonInput.value?.click()
}

const importCSV = () => {
  csvInput.value?.click()
}

const handleJSONChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const content = await readFileContent(file)
    if (importAllData(content)) {
      ElMessage.success('导入成功，页面将刷新')
      setTimeout(() => window.location.reload(), 1000)
    } else {
      ElMessage.error('导入失败，请检查文件格式')
    }
  } catch (e) {
    ElMessage.error('文件读取失败')
  }

  ;(event.target as HTMLInputElement).value = ''
}

const handleCSVChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const content = await readFileContent(file)
    const positions = parsePositionsFromCSV(content)

    if (positions.length === 0) {
      ElMessage.error('未解析到有效数据，请检查CSV格式')
      return
    }

    // 确认导入
    await ElMessageBox.confirm(
      `将导入 ${positions.length} 条持仓记录，是否继续？`,
      '确认导入',
      { type: 'info' }
    )

    // 批量添加
    positions.forEach(p => {
      positionStore.addPosition({
        fundCode: p.fundCode,
        fundName: p.fundName,
        buyDate: p.buyDate,
        buyNetValue: p.buyNetValue,
        shares: p.shares,
        amount: p.amount,
        remark: p.remark
      })
    })

    ElMessage.success(`成功导入 ${positions.length} 条持仓记录`)
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('导入失败：' + (e.message || '未知错误'))
    }
  }

  ;(event.target as HTMLInputElement).value = ''
}

const clearData = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有数据吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    localStorage.removeItem('fund-calculator-data')
    ElMessage.success('数据已清空，页面将刷新')
    setTimeout(() => window.location.reload(), 1000)
  } catch {
    // 取消操作
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
}

.settings-card {
  margin-bottom: 20px;
}

.data-stats {
  margin-bottom: 20px;
}

.data-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.csv-help {
  font-size: 14px;
}

.csv-help p {
  margin: 0 0 12px 0;
  color: #606266;
}

.csv-help .tips {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  color: #909399;
  font-size: 13px;
}

@media (max-width: 768px) {
  .data-actions {
    flex-direction: column;
  }

  .data-actions .el-button {
    width: 100%;
  }
}
</style>
