import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false
  }),
  
  getters: {
    currentTheme: (state) => state.isDark ? 'dark' : 'light'
  },
  
  actions: {
    // 初始化主题
    initTheme() {
      // 检查用户是否已手动设置主题
      const themeManualSet = localStorage.getItem('theme_manual_set')
      const savedTheme = localStorage.getItem('theme')
      
      if (savedTheme && themeManualSet === 'true') {
        // 用户已手动设置过主题，使用保存的设置
        this.isDark = savedTheme === 'dark'
      } else if (savedTheme) {
        // 有保存的主题但没有手动设置标记，可能是旧版本数据
        this.isDark = savedTheme === 'dark'
        // 标记为手动设置，避免后续被系统偏好覆盖
        localStorage.setItem('theme_manual_set', 'true')
      } else {
        // 默认使用浅色主题，避免浏览器主题切换干扰
        this.isDark = false
        localStorage.setItem('theme', 'light')
        localStorage.setItem('theme_manual_set', 'true')
      }
      this.applyTheme()
    },
    
    // 切换主题
    toggleTheme() {
      this.isDark = !this.isDark
      this.applyTheme()
      localStorage.setItem('theme', this.currentTheme)
      // 标记为手动设置
      localStorage.setItem('theme_manual_set', 'true')
    },
    
    // 设置主题
    setTheme(theme) {
      this.isDark = theme === 'dark'
      this.applyTheme()
      localStorage.setItem('theme', this.currentTheme)
    },
    
    // 强制设置主题（忽略系统偏好）
    forceSetTheme(theme) {
      this.isDark = theme === 'dark'
      this.applyTheme()
      localStorage.setItem('theme', this.currentTheme)
      // 标记用户已手动设置主题
      localStorage.setItem('theme_manual_set', 'true')
    },
    
    // 应用主题到DOM
    applyTheme() {
      const html = document.documentElement
      if (this.isDark) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }
  },
  
  persist: true
})
