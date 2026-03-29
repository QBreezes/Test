# 基金估计计算器

一款面向个人投资者的基金收益计算工具，帮助用户快速估算基金收益、管理持仓组合。

## 功能特性

- **大盘指数看板** - 实时展示上证/深证/创业板/沪深300指数
- **自选基金** - 收藏关注的基金，实时查看涨跌情况
- **基金搜索** - 支持基金代码/名称搜索，接入天天基金API
- **持仓管理** - 添加/编辑/删除持仓记录
- **收益计算** - 单次投资/定投收益计算
- **数据可视化** - 折线图/饼图/柱状图展示
- **数据导入导出** - 支持 JSON/CSV 格式
- **本地存储** - 数据保存在浏览器本地，无需注册登录
- **响应式设计** - 同时适配 PC 端和移动端

## 技术栈

| 技术 | 说明 |
|------|------|
| Vue 3 | 渐进式框架，Composition API |
| TypeScript | 类型安全 |
| Vite | 快速开发构建 |
| Element Plus | Vue 3 UI 组件库 |
| ECharts | 数据可视化图表 |
| Pinia | 状态管理 |
| Vue Router 4 | 单页应用路由 |

## 安装

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/QBreezes/Test.git

# 进入项目目录
cd Test

# 安装依赖
npm install
```

## 使用

### 开发模式

```bash
npm run dev
```

启动后访问 http://localhost:3000

### 生产构建

```bash
npm run build
```

构建产物位于 `dist/` 目录

### 预览生产版本

```bash
npm run preview
```

## 页面说明

| 页面 | 路由 | 功能 |
|------|------|------|
| 首页 | /home | 总览仪表盘，展示持仓统计和大盘指数 |
| 自选 | /watchlist | 自选基金列表，实时涨跌展示 |
| 持仓管理 | /positions | 持仓列表，支持增删改 |
| 收益计算 | /calculator | 单次/定投收益计算器 |
| 数据分析 | /analysis | 持仓分布饼图、收益趋势图 |
| 设置 | /settings | 数据导入导出、系统设置 |

## 快速开始

### 1. 搜索基金

在页面顶部搜索框输入基金代码或名称，回车搜索

### 2. 添加自选

搜索结果页点击"自选"按钮，将基金加入自选列表

### 3. 添加持仓

搜索结果页点击"详情" → "添加到持仓"，填写买入信息

### 4. 查看收益

- 首页查看总投入、总收益、收益率
- 数据分析页查看详细图表

### 5. 数据备份

设置页支持导出数据为 JSON/CSV 文件，也可导入备份文件

## 数据存储

数据保存在浏览器 localStorage 中，key 为 `fund-calculator-data`

```typescript
interface LocalStorageData {
  positions: Position[]           // 持仓列表
  fundCache: Record<string, Fund> // 基金信息缓存
  settings: UserSettings          // 用户设置
  watchlist: WatchlistItem[]      // 自选列表
  watchlistGroups: WatchlistGroup[] // 自选分组
}
```

> 注意：清除浏览器数据会导致数据丢失，请定期导出备份

## API 数据源

| 数据 | 来源 |
|------|------|
| 基金估值 | 天天基金 fundgz.1234567.com.cn |
| 历史净值 | 东方财富 api.fund.eastmoney.com |
| 大盘指数 | 新浪财经 hq.sinajs.cn |

开发环境通过 Vite 代理解决跨域问题

## 项目结构

```
src/
├── api/fund.ts           # 基金 API 接口
├── layouts/              # 布局组件
├── router/               # 路由配置
├── stores/               # Pinia 状态管理
├── types/                # TypeScript 类型定义
├── utils/                # 工具函数
│   ├── calculator.ts     # 收益计算
│   ├── storage.ts        # 本地存储
│   └── export.ts         # 导入导出
└── views/                # 页面组件
    ├── Home.vue          # 首页
    ├── Watchlist.vue     # 自选
    ├── Search.vue        # 搜索
    ├── Positions.vue     # 持仓
    ├── Calculator.vue    # 计算器
    ├── Analysis.vue      # 分析
    └── Settings.vue      # 设置
```

## License

MIT
