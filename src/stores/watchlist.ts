import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WatchlistItem, WatchlistGroup } from '@/types'
import { storage } from '@/utils/storage'
import { v4 as uuidv4 } from 'uuid'

export const useWatchlistStore = defineStore('watchlist', () => {
  // 自选列表
  const watchlist = ref<WatchlistItem[]>(storage.getWatchlist())

  // 分组列表
  const groups = ref<WatchlistGroup[]>(storage.getWatchlistGroups())

  // 自选数量
  const watchlistCount = computed(() => watchlist.value.length)

  // 添加到自选
  const addToWatchlist = (item: Omit<WatchlistItem, 'id' | 'addedAt'>) => {
    // 检查是否已存在
    if (isInWatchlist(item.fundCode)) {
      return false
    }

    const newItem: WatchlistItem = {
      ...item,
      id: uuidv4(),
      addedAt: new Date().toISOString()
    }
    watchlist.value.push(newItem)
    saveWatchlist()
    return true
  }

  // 从自选删除
  const removeFromWatchlist = (id: string) => {
    const index = watchlist.value.findIndex(item => item.id === id)
    if (index > -1) {
      watchlist.value.splice(index, 1)
      saveWatchlist()
      return true
    }
    return false
  }

  // 根据代码删除
  const removeFromWatchlistByCode = (code: string) => {
    const index = watchlist.value.findIndex(item => item.fundCode === code)
    if (index > -1) {
      watchlist.value.splice(index, 1)
      saveWatchlist()
      return true
    }
    return false
  }

  // 判断是否在自选中
  const isInWatchlist = (code: string) => {
    return watchlist.value.some(item => item.fundCode === code)
  }

  // 获取自选项
  const getWatchlistItem = (code: string): WatchlistItem | undefined => {
    return watchlist.value.find(item => item.fundCode === code)
  }

  // 移动到分组
  const moveToGroup = (id: string, groupId: string | undefined) => {
    const item = watchlist.value.find(i => i.id === id)
    if (item) {
      item.groupId = groupId
      saveWatchlist()
      return true
    }
    return false
  }

  // 添加分组
  const addGroup = (name: string) => {
    const newGroup: WatchlistGroup = {
      id: uuidv4(),
      name,
      order: groups.value.length
    }
    groups.value.push(newGroup)
    saveGroups()
    return newGroup
  }

  // 删除分组
  const removeGroup = (id: string) => {
    const index = groups.value.findIndex(g => g.id === id)
    if (index > -1) {
      groups.value.splice(index, 1)
      // 移除该分组下所有自选的groupId
      watchlist.value.forEach(item => {
        if (item.groupId === id) {
          item.groupId = undefined
        }
      })
      saveGroups()
      saveWatchlist()
      return true
    }
    return false
  }

  // 保存到本地存储
  const saveWatchlist = () => {
    storage.saveWatchlist(watchlist.value)
  }

  const saveGroups = () => {
    storage.saveWatchlistGroups(groups.value)
  }

  return {
    watchlist,
    groups,
    watchlistCount,
    addToWatchlist,
    removeFromWatchlist,
    removeFromWatchlistByCode,
    isInWatchlist,
    getWatchlistItem,
    moveToGroup,
    addGroup,
    removeGroup
  }
})
