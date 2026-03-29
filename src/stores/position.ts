import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Position, Fund, UserSettings } from '@/types'
import { storage } from '@/utils/storage'
import { v4 as uuidv4 } from 'uuid'

export const usePositionStore = defineStore('position', () => {
  // 持仓列表
  const positions = ref<Position[]>(storage.getPositions())

  // 基金缓存
  const fundCache = ref<Record<string, Fund>>(storage.getFundCache())

  // 用户设置
  const settings = ref<UserSettings>(storage.getSettings())

  // 添加持仓
  const addPosition = (position: Omit<Position, 'id'>) => {
    const newPosition: Position = {
      ...position,
      id: uuidv4()
    }
    positions.value.push(newPosition)
    savePositions()
    return newPosition
  }

  // 更新持仓
  const updatePosition = (id: string, data: Partial<Position>) => {
    const index = positions.value.findIndex(p => p.id === id)
    if (index > -1) {
      positions.value[index] = { ...positions.value[index], ...data }
      savePositions()
    }
  }

  // 删除持仓
  const deletePosition = (id: string) => {
    const index = positions.value.findIndex(p => p.id === id)
    if (index > -1) {
      positions.value.splice(index, 1)
      savePositions()
    }
  }

  // 根据基金代码获取持仓
  const getPositionsByCode = (code: string) => {
    return positions.value.filter(p => p.fundCode === code)
  }

  // 缓存基金信息
  const cacheFund = (fund: Fund) => {
    fundCache.value[fund.code] = fund
    saveFundCache()
  }

  // 获取缓存的基金信息
  const getCachedFund = (code: string): Fund | undefined => {
    return fundCache.value[code]
  }

  // 保存持仓到本地存储
  const savePositions = () => {
    storage.savePositions(positions.value)
  }

  // 保存基金缓存
  const saveFundCache = () => {
    storage.saveFundCache(fundCache.value)
  }

  // 更新设置
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    storage.saveSettings(settings.value)
  }

  // 总投入
  const totalCost = computed(() => {
    return positions.value.reduce((sum, p) => sum + p.amount, 0)
  })

  // 持仓数量
  const positionCount = computed(() => positions.value.length)

  return {
    positions,
    fundCache,
    settings,
    addPosition,
    updatePosition,
    deletePosition,
    getPositionsByCode,
    cacheFund,
    getCachedFund,
    updateSettings,
    totalCost,
    positionCount
  }
})
