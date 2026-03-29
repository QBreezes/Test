import type { Fund, NetValueHistory } from '@/types'

// ==================== 大盘指数 ====================

export interface MarketIndex {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  prevClose: number
  volume: number
  time: string
}

// 指数代码映射
const INDEX_CODES: Record<string, { code: string; market: string }> = {
  sh000001: { code: '000001', market: 'sh' },  // 上证指数
  sz399001: { code: '399001', market: 'sz' },  // 深证成指
  sz399006: { code: '399006', market: 'sz' },  // 创业板指
  sh000300: { code: '000300', market: 'sh' },  // 沪深300
  sh000016: { code: '000016', market: 'sh' },  // 上证50
  sz399005: { code: '399005', market: 'sz' },  // 中小板指
}

/**
 * 获取大盘指数数据（使用新浪接口）
 */
export async function fetchMarketIndexes(): Promise<MarketIndex[]> {
  const codes = ['sh000001', 'sz399001', 'sz399006', 'sh000300']

  try {
    // 使用新浪财经接口
    const url = `/api/stock/list=${codes.join(',')}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('请求失败')
    }

    const text = await response.text()
    const indexes: MarketIndex[] = []

    // 解析返回数据
    const lines = text.split('\n').filter(line => line.trim())
    lines.forEach((line, index) => {
      const match = line.match(/="(.+)"$/)
      if (match && match[1]) {
        const parts = match[1].split(',')
        if (parts.length >= 32) {
          const code = codes[index]
          const info = INDEX_CODES[code]

          indexes.push({
            code: info.code,
            name: getIndexName(info.code),
            price: parseFloat(parts[3]) || 0,
            change: parseFloat(parts[3]) - parseFloat(parts[2]) || 0,
            changePercent: ((parseFloat(parts[3]) - parseFloat(parts[2])) / parseFloat(parts[2])) * 100 || 0,
            high: parseFloat(parts[4]) || 0,
            low: parseFloat(parts[5]) || 0,
            open: parseFloat(parts[1]) || 0,
            prevClose: parseFloat(parts[2]) || 0,
            volume: parseFloat(parts[8]) || 0,
            time: parts[31] || parts[30] || ''
          })
        }
      }
    })

    return indexes.length > 0 ? indexes : getMockMarketIndexes()
  } catch (e) {
    console.error('获取大盘指数失败:', e)
    return getMockMarketIndexes()
  }
}

function getIndexName(code: string): string {
  const names: Record<string, string> = {
    '000001': '上证指数',
    '399001': '深证成指',
    '399006': '创业板指',
    '000300': '沪深300',
    '000016': '上证50',
    '399005': '中小板指'
  }
  return names[code] || code
}

/**
 * 模拟大盘指数数据
 */
export function getMockMarketIndexes(): MarketIndex[] {
  const now = new Date()
  const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

  return [
    {
      code: '000001',
      name: '上证指数',
      price: 3250.68,
      change: 25.36,
      changePercent: 0.79,
      high: 3268.45,
      low: 3225.12,
      open: 3230.15,
      prevClose: 3225.32,
      volume: 356789456,
      time
    },
    {
      code: '399001',
      name: '深证成指',
      price: 10856.32,
      change: -45.28,
      changePercent: -0.42,
      high: 10920.56,
      low: 10810.25,
      open: 10900.00,
      prevClose: 10901.60,
      volume: 456123789,
      time
    },
    {
      code: '399006',
      name: '创业板指',
      price: 2156.78,
      change: 12.34,
      changePercent: 0.58,
      high: 2170.45,
      low: 2145.20,
      open: 2150.00,
      prevClose: 2144.44,
      volume: 189456123,
      time
    },
    {
      code: '000300',
      name: '沪深300',
      price: 3856.45,
      change: 18.92,
      changePercent: 0.49,
      high: 3875.30,
      low: 3840.15,
      open: 3845.00,
      prevClose: 3837.53,
      volume: 289456789,
      time
    }
  ]
}

/**
 * 统一获取大盘指数（优先真实API）
 */
export async function getMarketIndexes(useRealApi: boolean = true): Promise<MarketIndex[]> {
  if (useRealApi) {
    return fetchMarketIndexes()
  }
  return getMockMarketIndexes()
}

/**
 * 根据基金代码查询基金信息
 * 使用天天基金API（通过Vite代理）
 */
export async function fetchFundInfo(code: string): Promise<Fund | null> {
  try {
    // 使用代理路径
    const url = `/api/fundgz/js/${code}.js`
    const response = await fetch(url)
    const text = await response.text()

    // 解析返回数据: jsonpgz({"fundcode":"000001","...
    const match = text.match(/jsonpgz\((.+)\)/)
    if (match) {
      const data = JSON.parse(match[1])
      return {
        code: data.fundcode,
        name: data.name,
        type: data.fundtype || '未知',
        currentNetValue: parseFloat(data.nav),
        dailyChange: parseFloat(data.gszzl) / 100,
        netValueDate: data.gztime
      }
    }
    return null
  } catch (e) {
    console.error('获取基金信息失败:', e)
    return null
  }
}

/**
 * 获取基金历史净值
 */
export async function fetchFundHistory(
  code: string,
  page: number = 1,
  size: number = 30
): Promise<NetValueHistory[]> {
  try {
    // 使用代理路径
    const url = `/api/fund-history/f10/lsjz?fund_code=${code}&page_index=${page}&page_size=${size}&sort=lsjz`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('请求失败')
    }

    const result = await response.json()

    if (result.Data && result.Data.LSJZList) {
      return result.Data.LSJZList.map((item: any) => ({
        date: item.FSRQ,
        netValue: parseFloat(item.DWJZ),
        dailyChange: parseFloat(item.JZZZL) / 100 || 0
      }))
    }

    return []
  } catch (e) {
    console.error('获取历史净值失败:', e)
    return []
  }
}

/**
 * 搜索基金
 */
export async function searchFunds(keyword: string): Promise<Fund[]> {
  try {
    // 使用代理路径
    const url = `/api/fund-search/FundSearch/api/FundSearchAPI.ashx?m=1&key=${encodeURIComponent(keyword)}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('搜索失败')
    }

    const text = await response.text()
    const match = text.match(/q=(.+)$/)

    if (match) {
      // 解析返回的数据格式
      const data = JSON.parse(decodeURIComponent(match[1]))
      return data.Datas.slice(0, 10).map((item: any) => ({
        code: item.CODE,
        name: item.NAME,
        type: item.FUNDTYPE || '未知',
        currentNetValue: parseFloat(item.NAV) || 0,
        dailyChange: 0,
        netValueDate: item.DATE || ''
      }))
    }

    return []
  } catch (e) {
    console.error('搜索基金失败:', e)
    return []
  }
}

/**
 * 获取基金详细信息（从东方财富）
 */
export async function fetchFundDetail(code: string): Promise<Partial<Fund> | null> {
  try {
    const url = `/api/fund-detail/tzzl/${code}.html`
    const response = await fetch(url)
    const text = await response.text()

    // 简单解析基金名称
    const nameMatch = text.match(/<title>(.+?)_基金/) || text.match(/fundName["']?\s*[:=]\s*["'](.+?)["']/)
    const name = nameMatch ? nameMatch[1] : ''

    return {
      code,
      name
    }
  } catch (e) {
    console.error('获取基金详情失败:', e)
    return null
  }
}

// ==================== 模拟数据（用于开发测试/备用） ====================

export function getMockFundInfo(code: string): Fund {
  const mockFunds: Record<string, Fund> = {
    '000001': {
      code: '000001',
      name: '华夏成长混合',
      type: '混合型',
      currentNetValue: 1.2340,
      dailyChange: 0.0234,
      netValueDate: '2026-03-29'
    },
    '000002': {
      code: '000002',
      name: '华夏回报混合A',
      type: '混合型',
      currentNetValue: 2.5670,
      dailyChange: -0.0123,
      netValueDate: '2026-03-29'
    },
    '000011': {
      code: '000011',
      name: '华夏大盘精选',
      type: '混合型',
      currentNetValue: 3.8920,
      dailyChange: 0.0156,
      netValueDate: '2026-03-29'
    },
    '110022': {
      code: '110022',
      name: '易方达消费行业',
      type: '股票型',
      currentNetValue: 5.4320,
      dailyChange: 0.0345,
      netValueDate: '2026-03-29'
    },
    '161725': {
      code: '161725',
      name: '招商中证白酒指数',
      type: '指数型',
      currentNetValue: 1.2345,
      dailyChange: 0.0289,
      netValueDate: '2026-03-29'
    },
    '260108': {
      code: '260108',
      name: '景顺长城新兴成长',
      type: '混合型',
      currentNetValue: 2.8760,
      dailyChange: -0.0087,
      netValueDate: '2026-03-29'
    }
  }

  return mockFunds[code] || {
    code,
    name: `基金${code}`,
    type: '混合型',
    currentNetValue: 1.0 + Math.random() * 2,
    dailyChange: (Math.random() - 0.5) * 0.1,
    netValueDate: new Date().toISOString().split('T')[0]
  }
}

export function getMockHistory(code: string): NetValueHistory[] {
  const history: NetValueHistory[] = []
  let value = 1.0 + Math.random() * 2

  for (let i = 60; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    // 模拟净值波动
    value += (Math.random() - 0.48) * 0.03
    if (value < 0.5) value = 0.5

    history.push({
      date: date.toISOString().split('T')[0],
      netValue: parseFloat(value.toFixed(4)),
      dailyChange: parseFloat(((Math.random() - 0.5) * 0.05).toFixed(4))
    })
  }

  return history
}

/**
 * 统一获取基金信息（优先真实API，失败回退模拟数据）
 */
export async function getFundInfo(code: string, useRealApi: boolean = true): Promise<Fund> {
  if (useRealApi) {
    const fund = await fetchFundInfo(code)
    if (fund) return fund
  }
  return getMockFundInfo(code)
}

/**
 * 统一获取历史净值（优先真实API，失败回退模拟数据）
 */
export async function getFundHistory(
  code: string,
  useRealApi: boolean = true,
  page: number = 1,
  size: number = 60
): Promise<NetValueHistory[]> {
  if (useRealApi) {
    const history = await fetchFundHistory(code, page, size)
    if (history.length > 0) return history
  }
  return getMockHistory(code)
}
