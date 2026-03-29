import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      // 天天基金API代理
      '/api/fundgz': {
        target: 'https://fundgz.1234567.com.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fundgz/, '')
      },
      // 东方财富基金历史净值API代理
      '/api/fund-history': {
        target: 'https://api.fund.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fund-history/, '')
      },
      // 东方财富基金搜索API代理
      '/api/fund-search': {
        target: 'https://fundsuggest.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fund-search/, '')
      },
      // 东方财富基金详情API代理
      '/api/fund-detail': {
        target: 'https://fund.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fund-detail/, '')
      },
      // 新浪股票行情API代理（用于大盘指数）
      '/api/stock': {
        target: 'https://hq.sinajs.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stock/, '')
      }
    }
  }
})
