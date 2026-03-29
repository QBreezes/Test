<template>
  <div class="positions-page">
    <!-- 操作栏 -->
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加持仓
        </el-button>
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </el-card>

    <!-- 持仓统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">总投入</div>
          <div class="stat-value">{{ formatMoney(stats.totalCost) }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">预计市值</div>
          <div class="stat-value">{{ formatMoney(stats.totalValue) }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">预计收益</div>
          <div class="stat-value" :class="{ 'profit-up': stats.totalProfit >= 0, 'profit-down': stats.totalProfit < 0 }">
            {{ stats.totalProfit >= 0 ? '+' : '' }}{{ formatMoney(stats.totalProfit) }}
            <span class="profit-rate">({{ stats.totalProfit >= 0 ? '+' : '' }}{{ formatPercent(stats.totalProfitRate) }})</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 持仓列表 -->
    <el-card shadow="never" class="list-card">
      <template #header>
        <span>持仓列表 ({{ positionStore.positions.length }})</span>
      </template>

      <el-empty v-if="positionStore.positions.length === 0" description="暂无持仓记录">
        <el-button type="primary" @click="showAddDialog">添加持仓</el-button>
      </el-empty>

      <el-table v-else :data="positionStore.positions" style="width: 100%">
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
        <el-table-column label="份额" width="100">
          <template #default="{ row }">
            {{ row.shares.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="buyDate" label="买入日期" width="120" />
        <el-table-column label="预计收益" width="120">
          <template #default="{ row }">
            <span :class="getProfitClass(row)">
              {{ getProfitText(row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" text @click="editPosition(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" text @click="deletePosition(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑持仓' : '添加持仓'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="基金代码" required>
          <el-input v-model="form.fundCode" placeholder="输入基金代码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="基金名称" required>
          <el-input v-model="form.fundName" placeholder="输入基金名称" />
        </el-form-item>
        <el-form-item label="买入日期" required>
          <el-date-picker
            v-model="form.buyDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="买入净值" required>
          <el-input-number v-model="form.buyNetValue" :precision="4" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="买入金额" required>
          <el-input-number v-model="form.amount" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="份额">
          <el-input-number v-model="form.shares" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePositionStore } from '@/stores/position'
import { formatMoney as fmtMoney, formatPercent as fmtPercent, calculateProfit, calculateProfitRate } from '@/utils/calculator'
import { storage } from '@/utils/storage'
import type { Position } from '@/types'

const positionStore = usePositionStore()

const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref('')

const form = ref({
  fundCode: '',
  fundName: '',
  buyDate: '',
  buyNetValue: 0,
  amount: 0,
  shares: 0,
  remark: ''
})

// 计算份额
watch(() => [form.value.amount, form.value.buyNetValue], () => {
  if (form.value.buyNetValue > 0) {
    form.value.shares = form.value.amount / form.value.buyNetValue
  }
})

// 统计数据
const stats = computed(() => {
  const totalCost = positionStore.totalCost
  // 模拟当前净值（实际应从API获取）
  const totalValue = positionStore.positions.reduce((sum, p) => {
    const currentNetValue = p.buyNetValue * (1 + Math.random() * 0.1 - 0.05)
    return sum + p.shares * currentNetValue
  }, 0)

  const totalProfit = totalValue - totalCost
  const totalProfitRate = totalCost > 0 ? totalProfit / totalCost : 0

  return {
    totalCost,
    totalValue,
    totalProfit,
    totalProfitRate
  }
})

const formatMoney = (value: number) => fmtMoney(value)
const formatPercent = (value: number) => fmtPercent(value)

const getProfitClass = (position: Position) => {
  const currentNetValue = position.buyNetValue * (1 + Math.random() * 0.1 - 0.05)
  const profit = calculateProfit(currentNetValue, position.buyNetValue, position.shares)
  return profit >= 0 ? 'profit-up' : 'profit-down'
}

const getProfitText = (position: Position) => {
  const currentNetValue = position.buyNetValue * (1 + Math.random() * 0.1 - 0.05)
  const profit = calculateProfit(currentNetValue, position.buyNetValue, position.shares)
  return (profit >= 0 ? '+' : '') + fmtMoney(profit)
}

const showAddDialog = () => {
  isEdit.value = false
  editingId.value = ''
  form.value = {
    fundCode: '',
    fundName: '',
    buyDate: '',
    buyNetValue: 0,
    amount: 1000,
    shares: 0,
    remark: ''
  }
  dialogVisible.value = true
}

const editPosition = (position: Position) => {
  isEdit.value = true
  editingId.value = position.id
  form.value = {
    fundCode: position.fundCode,
    fundName: position.fundName,
    buyDate: position.buyDate,
    buyNetValue: position.buyNetValue,
    amount: position.amount,
    shares: position.shares,
    remark: position.remark || ''
  }
  dialogVisible.value = true
}

const deletePosition = async (position: Position) => {
  try {
    await ElMessageBox.confirm('确定要删除该持仓记录吗？', '提示', {
      type: 'warning'
    })
    positionStore.deletePosition(position.id)
    ElMessage.success('删除成功')
  } catch {
    // 取消删除
  }
}

const submitForm = () => {
  if (!form.value.fundCode || !form.value.fundName || !form.value.buyDate || form.value.amount <= 0) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (isEdit.value) {
    positionStore.updatePosition(editingId.value, {
      fundName: form.value.fundName,
      buyDate: form.value.buyDate,
      buyNetValue: form.value.buyNetValue,
      amount: form.value.amount,
      shares: form.value.shares,
      remark: form.value.remark
    })
    ElMessage.success('更新成功')
  } else {
    positionStore.addPosition({
      fundCode: form.value.fundCode,
      fundName: form.value.fundName,
      buyDate: form.value.buyDate,
      buyNetValue: form.value.buyNetValue,
      amount: form.value.amount,
      shares: form.value.shares,
      remark: form.value.remark
    })
    ElMessage.success('添加成功')
  }

  dialogVisible.value = false
}

const exportData = () => {
  const data = storage.exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fund-data-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.positions-page {
  max-width: 1200px;
  margin: 0 auto;
}

.toolbar-card {
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  gap: 12px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.profit-up {
  color: #67c23a;
}

.profit-down {
  color: #f56c6c;
}

.profit-rate {
  font-size: 14px;
  margin-left: 4px;
}

.list-card {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .stat-value {
    font-size: 18px;
  }
}
</style>
