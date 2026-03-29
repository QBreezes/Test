// 基金信息
export interface Fund {
  code: string           // 基金代码
  name: string           // 基金名称
  type: string           // 基金类型（股票型/债券型/混合型等）
  currentNetValue: number // 当前净值
  dailyChange: number    // 日涨跌幅
  netValueDate: string   // 净值日期
}

// 持仓记录
export interface Position {
  id: string             // 记录ID
  fundCode: string       // 基金代码
  fundName: string       // 基金名称
  buyDate: string        // 买入日期
  buyNetValue: number    // 买入净值
  shares: number         // 份额
  amount: number         // 买入金额
  remark?: string        // 备注
}

// 历史净值
export interface NetValueHistory {
  date: string
  netValue: number
  dailyChange: number
}

// 用户设置
export interface UserSettings {
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
}

// 本地存储结构
export interface LocalStorageData {
  positions: Position[]
  fundCache: Record<string, Fund>
  settings: UserSettings
  watchlist: WatchlistItem[]
  watchlistGroups: WatchlistGroup[]
}

// 持仓统计
export interface PositionStats {
  totalCost: number      // 总投入
  totalValue: number     // 当前总市值
  totalProfit: number    // 总收益
  totalProfitRate: number // 总收益率
  positions: PositionDetail[]
}

// 持仓详情
export interface PositionDetail {
  position: Position
  fund?: Fund
  currentValue: number   // 当前市值
  profit: number         // 收益
  profitRate: number     // 收益率
  holdingDays: number    // 持有天数
}

// 自选基金项
export interface WatchlistItem {
  id: string             // 记录ID
  fundCode: string       // 基金代码
  fundName: string       // 基金名称
  fundType: string       // 基金类型（关联板块）
  addedAt: string        // 添加时间
  groupId?: string       // 所属分组ID
}

// 自选分组
export interface WatchlistGroup {
  id: string             // 分组ID
  name: string           // 分组名称
  order: number          // 排序
}
