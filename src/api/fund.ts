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
 * 获取大盘指数数据（使用新浪接口）
 */
export async function getMarketIndexes(): Promise<MarketIndex[]> {
  const codes = ['sh000001', 'sz399001', 'sz399006', 'sh000300']

  try {
    const url = `/api/stock/list=${codes.join(',')}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('请求失败')
    }

    const text = await response.text()
    const indexes: MarketIndex[] = []

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

    return indexes
  } catch (e) {
    console.error('获取大盘指数失败:', e)
    return []
  }
}

/**
 * 根据基金代码查询基金信息
 * 使用天天基金API（通过Vite代理）
 */
export async function getFundInfo(code: string): Promise<Fund | null> {
  try {
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
export async function getFundHistory(
  code: string,
  page: number = 1,
  size: number = 60
): Promise<NetValueHistory[]> {
  try {
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
    const url = `/api/fund-search/FundSearch/api/FundSearchAPI.ashx?m=1&key=${encodeURIComponent(keyword)}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('搜索失败')
    }

    const text = await response.text()
    const match = text.match(/q=(.+)$/)

    if (match) {
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
