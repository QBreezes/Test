# 基金估计计算App

## 项目简介

基金估计计算App是一款面向个人投资者的基金收益计算工具，帮助用户快速、准确地估算基金收益、管理持仓组合。

### 技术栈
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **图表库**: ECharts
- **状态管理**: Pinia
- **路由**: Vue Router 4

### 核心功能
- 大盘指数看板（上证/深证/创业板/沪深300）
- 基金查询（代码/名称搜索，支持真实API）
- 持仓管理（添加/编辑/删除）
- 收益计算（单次投资/定投）
- 数据可视化（折线图/饼图/柱状图）
- 数据导入导出（JSON/CSV）
- 本地数据存储（localStorage）

---

## 项目结构

```
src/
├── api/fund.ts           # 基金API接口（含大盘指数）
├── layouts/MainLayout.vue # 主布局
├── router/index.ts       # 路由配置
├── stores/position.ts    # 状态管理
├── types/index.ts        # 类型定义
├── utils/
│   ├── calculator.ts     # 计算工具
│   ├── storage.ts        # 存储工具
│   └── export.ts         # 导入导出工具
└── views/
    ├── Home.vue          # 首页（含大盘指数看板）
    ├── Search.vue        # 基金查询
    ├── Positions.vue     # 持仓管理
    ├── Calculator.vue    # 收益计算
    ├── Analysis.vue      # 数据分析
    └── Settings.vue      # 设置（含CSV导入导出）
```

---

## 开发命令

```bash
npm install     # 安装依赖
npm run dev     # 启动开发服务器 (http://localhost:3000)
npm run build   # 构建生产版本
npm run preview # 预览生产版本
```

---

## 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| / | 首页 | 总览仪表盘 |
| /search | 基金查询 | 搜索基金信息 |
| /positions | 持仓管理 | 管理持仓记录 |
| /calculator | 收益计算 | 计算投资收益 |
| /analysis | 数据分析 | 图表可视化 |
| /settings | 设置 | 系统设置 |

---

## 数据存储

使用 localStorage 存储以下数据，key为 `fund-calculator-data`：

```typescript
interface LocalStorageData {
  positions: Position[]           // 持仓列表
  fundCache: Record<string, Fund> // 基金信息缓存
  settings: UserSettings          // 用户设置
}
```

---

## 核心类型定义

### 基金信息 Fund
```typescript
interface Fund {
  code: string           // 基金代码
  name: string           // 基金名称
  type: string           // 基金类型（股票型/债券型/混合型等）
  currentNetValue: number // 当前净值
  dailyChange: number    // 日涨跌幅
  netValueDate: string   // 净值日期
}
```

### 持仓记录 Position
```typescript
interface Position {
  id: string             // 记录ID
  fundCode: string       // 基金代码
  fundName: string       // 基金名称
  buyDate: string        // 买入日期
  buyNetValue: number    // 买入净值
  shares: number         // 份额
  amount: number         // 买入金额
  remark?: string        // 备注
}
```

---

## 收益计算公式

### 单次投资收益
```
收益 = (当前净值 - 买入净值) × 份额
收益率 = 收益 / 本金
年化收益率 = (1 + 收益率)^(365/持有天数) - 1
```

### 份额计算
```
份额 = 买入金额 / 买入净值
```

### 定投收益
```
总份额 = Σ(每期金额 / 当期净值)
当前市值 = 总份额 × 当前净值
收益 = 当前市值 - 总投入
```

---

## API接口

### 基金数据来源
- **天天基金API**: `https://fundgz.1234567.com.cn/js/{code}.js`
- **历史净值**: `https://api.fund.eastmoney.com/f10/lsjz`
- **大盘指数**: `https://hq.sinajs.cn/list=sh000001,sz399001,sz399006,sh000300`

### Vite代理配置
开发环境通过Vite代理解决跨域：
- `/api/fundgz` → 天天基金估值
- `/api/fund-history` → 东方财富历史净值
- `/api/stock` → 新浪股票行情

### 本地模拟数据
开发环境使用模拟数据，位于 `src/api/fund.ts`：
- `getMockFundInfo(code)` - 获取模拟基金信息
- `getMockHistory(code)` - 获取模拟历史净值
- `getMockMarketIndexes()` - 获取模拟大盘指数

---

## 编码规范

### 命名规范
- **文件名**: 小写kebab-case (如 `main-layout.vue`)
- **组件名**: PascalCase (如 `MainLayout`)
- **变量/函数**: camelCase (如 `totalCost`)
- **常量**: UPPER_SNAKE_CASE (如 `STORAGE_KEY`)
- **类型/接口**: PascalCase (如 `Position`, `Fund`)

### Vue组件规范
- 使用 `<script setup>` 语法
- 使用 Composition API
- Props 使用 `defineProps` with TypeScript
- Emits 使用 `defineEmits`

### 样式规范
- 使用 scoped 样式
- 响应式断点: 768px (移动端/PC端)
- 颜色变量使用 Element Plus 主题色

---

## Git提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具相关
```

示例：
```
feat: 添加基金对比功能
fix: 修复收益计算精度问题
docs: 更新API文档
```

---

## 注意事项

1. **数据精度**: 净值保留4位小数，金额保留2位小数
2. **本地存储**: 数据仅存储在浏览器本地，清除浏览器数据会丢失
3. **API限制**: 天天基金API有跨域限制，生产环境需要后端代理
4. **响应式**: 测试时请同时验证PC端和移动端布局

---

## 后续优化方向

- [x] 接入真实基金API（已配置代理）
- [x] 支持CSV导入导出
- [ ] 添加基金对比功能
- [ ] 支持多账户管理
- [ ] PWA离线支持
- [ ] 暗色主题

---

## 相关文档

- [需求文档.md](./需求文档.md) - 详细需求分析
