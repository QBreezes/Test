import dayjs from 'dayjs'

/**
 * 计算单次投资收益
 * @param currentNetValue 当前净值
 * @param buyNetValue 买入净值
 * @param shares 份额
 * @returns 收益金额
 */
export function calculateProfit(
  currentNetValue: number,
  buyNetValue: number,
  shares: number
): number {
  return (currentNetValue - buyNetValue) * shares
}

/**
 * 计算收益率
 * @param profit 收益金额
 * @param principal 本金
 * @returns 收益率（小数）
 */
export function calculateProfitRate(profit: number, principal: number): number {
  if (principal === 0) return 0
  return profit / principal
}

/**
 * 计算年化收益率
 * @param profitRate 收益率（小数）
 * @param days 持有天数
 * @returns 年化收益率（小数）
 */
export function calculateAnnualizedReturn(
  profitRate: number,
  days: number
): number {
  if (days === 0) return 0
  return Math.pow(1 + profitRate, 365 / days) - 1
}

/**
 * 计算持有天数
 * @param buyDate 买入日期
 * @returns 持有天数
 */
export function calculateHoldingDays(buyDate: string): number {
  const buy = dayjs(buyDate)
  const now = dayjs()
  return now.diff(buy, 'day')
}

/**
 * 计算份额
 * @param amount 投资金额
 * @param netValue 买入净值
 * @returns 份额
 */
export function calculateShares(amount: number, netValue: number): number {
  if (netValue === 0) return 0
  return amount / netValue
}

/**
 * 计算定投收益（简化版）
 * @param investments 每期投资 [{ date: string, amount: number, netValue: number }]
 * @param currentNetValue 当前净值
 * @returns { totalCost: 总投入, totalShares: 总份额, currentValue: 当前市值, profit: 收益, profitRate: 收益率 }
 */
export function calculateDCAProfit(
  investments: Array<{ date: string; amount: number; netValue: number }>,
  currentNetValue: number
): {
  totalCost: number
  totalShares: number
  currentValue: number
  profit: number
  profitRate: number
} {
  let totalCost = 0
  let totalShares = 0

  for (const inv of investments) {
    totalCost += inv.amount
    totalShares += calculateShares(inv.amount, inv.netValue)
  }

  const currentValue = totalShares * currentNetValue
  const profit = currentValue - totalCost
  const profitRate = calculateProfitRate(profit, totalCost)

  return {
    totalCost,
    totalShares,
    currentValue,
    profit,
    profitRate
  }
}

/**
 * 格式化金额
 */
export function formatMoney(value: number, decimals: number = 2): string {
  return value.toFixed(decimals)
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return (value * 100).toFixed(decimals) + '%'
}

/**
 * 判断是否为涨
 */
export function isPositive(value: number): boolean {
  return value > 0
}
