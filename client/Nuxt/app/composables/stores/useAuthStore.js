import { defineStore } from 'pinia'
import { useAuth } from '../auth/useAuth.js'
import { useUserManager } from '../useApiService.js'

let checkPromise = null

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAuthenticated: false,
        initialized: false
    }),

    getters: {
        isLoggedIn: (state) => state.isAuthenticated && state.user !== null
    },

    actions: {
        setUser(user) {
            this.user = user
            this.isAuthenticated = !!user
            if (import.meta.client && user) {
                localStorage.setItem('auth_user', JSON.stringify(user))
            } else if (import.meta.client) {
                localStorage.removeItem('auth_user')
            }
        },

        clearUser() {
            this.user = null
            this.isAuthenticated = false
            if (import.meta.client) {
                localStorage.removeItem('auth_user')
            }
        },

        // 添加初始化方法，从 localStorage 恢复状态
        initFromStorage() {
            if (import.meta.client) {
                const storedUser = localStorage.getItem('auth_user')
                if (storedUser) {
                    try {
                        const user = JSON.parse(storedUser)
                        this.user = user
                        this.isAuthenticated = true
                    } catch (e) {
                        console.error('解析存储的用户信息失败:', e)
                        localStorage.removeItem('auth_user')
                    }
                }
            }
        },

        async checkAuthStatus(force = false) {
            // 如果已经有一个正在进行的检查，返回同一个 Promise
            if (!force && checkPromise) {
                return checkPromise
            }

            // 如果已经初始化过且不是强制检查，直接返回当前状态
            if (this.initialized && !force) {
                return {
                    success: true,
                    logged_in: this.isAuthenticated,
                    user: this.user
                }
            }

            // 创建新的检查 Promise
            checkPromise = this._performCheck()

            try {
                const result = await checkPromise
                return result
            } finally {
                // 检查完成后清除 Promise 引用
                checkPromise = null
            }
        },

        async _performCheck() {
            try {
                // 页面刷新后从 localStorage 初始化状态
                if (!this.initialized) {
                    this.initFromStorage()
                }
                
                const { checkLoginStatus } = useAuth()
                const result = await checkLoginStatus()

                if (result.success && result.logged_in) {
                    // 只设置登录状态，不自动获取用户信息
                    this.isAuthenticated = true
                } else {
                    this.clearUser()
                }

                this.initialized = true
                return result
            } catch (error) {
                console.error('检查认证状态失败:', error)
                return {
                    success: false,
                    message: '网络错误'
                }
            }
        },

        async logout() {
            try {
                const { logout } = useAuth()
                const result = await logout()

                if (result.success) {
                    this.clearUser()
                    this.initialized = false
                }

                return result
            } catch (error) {
                console.error('登出失败:', error)
                this.clearUser()
                this.initialized = false
                return {
                    success: false,
                    message: '网络错误'
                }
            }
        },

        // 重置初始化状态，用于强制重新检查
        resetInitialization() {
            this.initialized = false
            checkPromise = null // 同时清除检查 Promise
        },
        
        // 按需加载用户信息
        async loadUserInfo() {
            if (!this.isAuthenticated) {
                return { success: false, message: '用户未登录' }
            }
            
            if (this.user) {
                return { success: true, data: this.user }
            }
            
            try {
                const { getUserInfo } = useUserManager()
                const userInfoResult = await getUserInfo()

                if (userInfoResult.success && userInfoResult.logged_in) {
                    this.setUser(userInfoResult.data)
                    return { success: true, data: userInfoResult.data }
                } else {
                    // 用户信息获取失败，清除用户状态
                    this.clearUser()
                    return { success: false, message: '获取用户信息失败' }
                }
            } catch (error) {
                console.error('获取用户信息失败:', error)
                return { success: false, message: '网络错误' }
            }
        }
    }
})

// 为了确保在服务端也能使用，导出一个函数
export const useAuthStoreClient = () => {
    if (import.meta.client) {
        return useAuthStore()
    }
    // 在服务端返回一个模拟的 store
    return {
        user: null,
        isAuthenticated: false,
        initialized: false,
        isLoggedIn: false,
        checkAuthStatus: async () => ({ success: true, logged_in: false }),
        logout: async () => ({ success: true }),
        setUser: () => { },
        clearUser: () => { },
        resetInitialization: () => { },
        loadUserInfo: async () => ({ success: false }),
        initFromStorage: () => { }
    }
}