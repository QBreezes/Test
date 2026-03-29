import type { Position, Fund, UserSettings, LocalStorageData, WatchlistItem, WatchlistGroup } from '@/types'

const STORAGE_KEY = 'fund-calculator-data'

const defaultSettings: UserSettings = {
  theme: 'light',
  language: 'zh-CN'
}

const defaultData: LocalStorageData = {
  positions: [],
  fundCache: {},
  settings: defaultSettings,
  watchlist: [],
  watchlistGroups: []
}

// 获取所有数据
function getData(): LocalStorageData {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return { ...defaultData, ...JSON.parse(data) }
    }
  } catch (e) {
    console.error('读取本地存储失败:', e)
  }
  return defaultData
}

// 保存所有数据
function saveData(data: LocalStorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('保存本地存储失败:', e)
  }
}

// 获取持仓列表
export function getPositions(): Position[] {
  return getData().positions
}

// 保存持仓列表
export function savePositions(positions: Position[]): void {
  const data = getData()
  data.positions = positions
  saveData(data)
}

// 获取基金缓存
export function getFundCache(): Record<string, Fund> {
  return getData().fundCache
}

// 保存基金缓存
export function saveFundCache(cache: Record<string, Fund>): void {
  const data = getData()
  data.fundCache = cache
  saveData(data)
}

// 获取用户设置
export function getSettings(): UserSettings {
  return getData().settings
}

// 保存用户设置
export function saveSettings(settings: UserSettings): void {
  const data = getData()
  data.settings = settings
  saveData(data)
}

// 导出数据
export function exportData(): string {
  return JSON.stringify(getData(), null, 2)
}

// 导入数据
export function importData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr) as LocalStorageData
    if (data.positions && data.fundCache && data.settings) {
      saveData(data)
      return true
    }
  } catch (e) {
    console.error('导入数据失败:', e)
  }
  return false
}

// 清空所有数据
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// 获取自选列表
export function getWatchlist(): WatchlistItem[] {
  return getData().watchlist || []
}

// 保存自选列表
export function saveWatchlist(watchlist: WatchlistItem[]): void {
  const data = getData()
  data.watchlist = watchlist
  saveData(data)
}

// 获取自选分组
export function getWatchlistGroups(): WatchlistGroup[] {
  return getData().watchlistGroups || []
}

// 保存自选分组
export function saveWatchlistGroups(groups: WatchlistGroup[]): void {
  const data = getData()
  data.watchlistGroups = groups
  saveData(data)
}

export const storage = {
  getPositions,
  savePositions,
  getFundCache,
  saveFundCache,
  getSettings,
  saveSettings,
  exportData,
  importData,
  clearAllData,
  getWatchlist,
  saveWatchlist,
  getWatchlistGroups,
  saveWatchlistGroups
}
