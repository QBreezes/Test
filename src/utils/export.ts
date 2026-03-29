import type { Position, Fund, LocalStorageData } from '@/types'
import { storage } from './storage'

/**
 * 导出持仓为CSV格式
 */
export function exportPositionsToCSV(positions: Position[]): string {
  const headers = ['基金代码', '基金名称', '买入日期', '买入净值', '份额', '买入金额', '备注']
  const rows = positions.map(p => [
    p.fundCode,
    p.fundName,
    p.buyDate,
    p.buyNetValue.toString(),
    p.shares.toString(),
    p.amount.toString(),
    p.remark || ''
  ])

  // 添加BOM以支持中文
  const BOM = '\uFEFF'
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return BOM + csvContent
}

/**
 * 从CSV解析持仓数据
 */
export function parsePositionsFromCSV(csvContent: string): Position[] {
  const lines = csvContent.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const positions: Position[] = []

  // 跳过标题行
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // 解析CSV行（处理引号内的逗号）
    const cells: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    cells.push(current.trim())

    if (cells.length >= 6) {
      positions.push({
        id: `import_${Date.now()}_${i}`,
        fundCode: cells[0],
        fundName: cells[1],
        buyDate: cells[2],
        buyNetValue: parseFloat(cells[3]) || 0,
        shares: parseFloat(cells[4]) || 0,
        amount: parseFloat(cells[5]) || 0,
        remark: cells[6] || ''
      })
    }
  }

  return positions
}

/**
 * 下载文件
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * 读取文件内容
 */
export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      resolve(content)
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

/**
 * 导出所有数据为JSON
 */
export function exportAllData(): string {
  return storage.exportData()
}

/**
 * 导入JSON数据
 */
export function importAllData(jsonStr: string): boolean {
  return storage.importData(jsonStr)
}

/**
 * 导出持仓为CSV文件
 */
export function downloadPositionsCSV(positions: Position[]) {
  const csv = exportPositionsToCSV(positions)
  const date = new Date().toISOString().split('T')[0]
  downloadFile(csv, `持仓数据_${date}.csv`)
}

/**
 * 导出所有数据为JSON文件
 */
export function downloadAllDataJSON() {
  const json = exportAllData()
  const date = new Date().toISOString().split('T')[0]
  downloadFile(json, `基金数据备份_${date}.json`, 'application/json')
}
