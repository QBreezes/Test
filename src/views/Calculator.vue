<template>
  <div class="calculator-page">
    <el-row :gutter="20">
      <!-- 单次投资计算器 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="calc-card">
          <template #header>
            <span>单次投资计算</span>
          </template>

          <el-form :model="singleForm" label-width="100px">
            <el-form-item label="买入金额">
              <el-input-number v-model="singleForm.amount" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
            <el-form-item label="买入净值">
              <el-input-number v-model="singleForm.buyNetValue" :precision="4" :min="0.0001" style="width: 100%" />
            </el-form-item>
            <el-form-item label="当前净值">
              <el-input-number v-model="singleForm.currentNetValue" :precision="4" :min="0" style="width: 100%" />
            </el-form-item>
            <el-form-item label="持有天数">
              <el-input-number v-model="singleForm.days" :min="0" style="width: 100%" />
            </el-form-item>
          </el-form>

          <el-divider />

          <div class="result-section">
            <el-row :gutter="16">
              <el-col :span="12">
                <div class="result-item">
                  <div class="result-label">份额</div>
                  <div class="result-value">{{ formatNumber(singleResult.shares) }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="result-item">
                  <div class="result-label">当前市值</div>
                  <div class="result-value">{{ formatMoney(singleResult.currentValue) }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="result-item">
                  <div class="result-label">收益</div>
                  <div class="result-value" :class="singleResult.profit >= 0 ? 'profit-up' : 'profit-down'">
                    {{ singleResult.profit >= 0 ? '+' : '' }}{{ formatMoney(singleResult.profit) }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="result-item">
                  <div class="result-label">收益率</div>
                  <div class="result-value" :class="singleResult.profitRate >= 0 ? 'profit-up' : 'profit-down'">
                    {{ singleResult.profitRate >= 0 ? '+' : '' }}{{ formatPercent(singleResult.profitRate) }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="result-item">
                  <div class="result-label">年化收益</div>
                  <div class="result-value" :class="singleResult.annualizedReturn >= 0 ? 'profit-up' : 'profit-down'">
                    {{ singleResult.annualizedReturn >= 0 ? '+' : '' }}{{ formatPercent(singleResult.annualizedReturn) }}
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>

      <!-- 定投计算器 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="calc-card">
          <template #header>
            <div class="card-header">
              <span>定投计算</span>
              <el-button type="primary" size="small" @click="addInvestment">添加一期</el-button>
            </div>
          </template>

          <el-form :model="dcaForm" label-width="100px">
            <el-form-item label="每期金额">
              <el-input-number v-model="dcaForm.amount" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
            <el-form-item label="投资期数">
              <el-input-number v-model="dcaForm.periods" :min="1" :max="120" style="width: 100%" />
            </el-form-item>
            <el-form-item label="当前净值">
              <el-input-number v-model="dcaForm.currentNetValue" :precision="4" :min="0" style="width: 100%" />
            </el-form-item>
          </el-form>

          <el-divider />

          <div class="result-section">
            <el-row :gutter="16">
              <el-col :span="12">
                <div class="result-item">
                  <div class="result-label">总投入</div>
                  <div class="result-value">{{ formatMoney(dcaResult.totalCost) }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="result-item">
                  <div class="result-label">总份额</div>
                  <div class="result-value">{{ formatNumber(dcaResult.totalShares) }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="result-item">
                  <div class="result-label">当前市值</div>
                  <div class="result-value">{{ formatMoney(dcaResult.currentValue) }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="result-item">
                  <div class="result-label">收益</div>
                  <div class="result-value" :class="dcaResult.profit >= 0 ? 'profit-up' : 'profit-down'">
                    {{ dcaResult.profit >= 0 ? '+' : '' }}{{ formatMoney(dcaResult.profit) }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="result-item">
                  <div class="result-label">收益率</div>
                  <div class="result-value" :class="dcaResult.profitRate >= 0 ? 'profit-up' : 'profit-down'">
                    {{ dcaResult.profitRate >= 0 ? '+' : '' }}{{ formatPercent(dcaResult.profitRate) }}
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  calculateShares,
  calculateProfit,
  calculateProfitRate,
  calculateAnnualizedReturn,
  calculateDCAProfit,
  formatMoney as fmtMoney,
  formatPercent as fmtPercent
} from '@/utils/calculator'

const singleForm = ref({
  amount: 10000,
  buyNetValue: 1.0,
  currentNetValue: 1.1,
  days: 365
})

const dcaForm = ref({
  amount: 1000,
  periods: 12,
  currentNetValue: 1.2
})

const singleResult = computed(() => {
  const shares = calculateShares(singleForm.value.amount, singleForm.value.buyNetValue)
  const currentValue = shares * singleForm.value.currentNetValue
  const profit = calculateProfit(singleForm.value.currentNetValue, singleForm.value.buyNetValue, shares)
  const profitRate = calculateProfitRate(profit, singleForm.value.amount)
  const annualizedReturn = calculateAnnualizedReturn(profitRate, singleForm.value.days)

  return {
    shares,
    currentValue,
    profit,
    profitRate,
    annualizedReturn
  }
})

const dcaResult = computed(() => {
  // 定投数据（基于输入的净值区间）
  const investments = []
  const startNetValue = dcaForm.value.currentNetValue * 0.8 // 假设起点净值为当前的80%

  for (let i = 0; i < dcaForm.value.periods; i++) {
    // 每期净值线性变化
    const netValue = startNetValue + (dcaForm.value.currentNetValue - startNetValue) * (i / dcaForm.value.periods)
    investments.push({
      date: '',
      amount: dcaForm.value.amount,
      netValue
    })
  }

  return calculateDCAProfit(investments, dcaForm.value.currentNetValue)
})

const formatMoney = (value: number) => fmtMoney(value)
const formatPercent = (value: number) => fmtPercent(value)
const formatNumber = (value: number) => value.toFixed(2)

const addInvestment = () => {
  dcaForm.value.periods++
}
</script>

<style scoped>
.calculator-page {
  max-width: 1200px;
  margin: 0 auto;
}

.calc-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-section {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.result-item {
  text-align: center;
  padding: 12px 0;
}

.result-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.result-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.profit-up {
  color: #67c23a;
}

.profit-down {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .result-value {
    font-size: 16px;
  }
}
</style>
