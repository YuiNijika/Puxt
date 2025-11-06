import { authApi } from '../useApiService.js'

export const useAuth = () => {
    const auth = authApi

    // 添加本地缓存变量
    let localAuthCache = null
    let localCacheTime = 0
    const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

    // 获取存储的用户信息
    const getStoredUser = () => {
        if (import.meta.client) {
            const stored = localStorage.getItem('auth_user')
            return stored ? JSON.parse(stored) : null
        }
        return null
    }

    // 保存用户信息到 localStorage
    const setStoredUser = (user) => {
        if (import.meta.client && user) {
            localStorage.setItem('auth_user', JSON.stringify(user))
        }
    }

    // 清除存储的用户信息
    const clearStoredUser = () => {
        if (import.meta.client) {
            localStorage.removeItem('auth_user')
        }
    }

    // 清除本地缓存
    const clearLocalCache = () => {
        localAuthCache = null
        localCacheTime = 0
    }

    // 检查登录状态
    const checkLoginStatus = async (force = false) => {
        // 检查本地缓存是否有效 除非强制刷新
        const now = Date.now()
        if (!force && localAuthCache && (now - localCacheTime) < CACHE_DURATION) {
            return localAuthCache
        }

        try {
            const response = await auth.checkLogin()
            const data = normalizeApiResponse(response)

            // 如果服务器返回已登录，则获取用户信息
            if (data.success && response.logged_in) {
                const result = {
                    success: true,
                    logged_in: true
                }
                // 更新本地缓存
                localAuthCache = result
                localCacheTime = now
                return result
            } else if (data.success && !response.logged_in) {
                // 如果服务器返回未登录，清除本地存储
                clearStoredUser()
                const result = {
                    success: true,
                    logged_in: false
                }
                // 更新本地缓存
                localAuthCache = result
                localCacheTime = now
                return result
            }

            return data
        } catch (error) {
            console.error('检查登录状态失败:', error)
            return {
                success: false,
                logged_in: false,
                message: handleApiError(error, '检查登录状态失败')
            }
        }
    }

    // 登录
    const login = async (credentials) => {
        try {
            const response = await auth.login(credentials)
            const data = normalizeApiResponse(response)

            // 登录成功时保存用户信息
            if (data.success && response.data) {
                setStoredUser(response.data)
                // 清除缓存以便下次重新检查
                clearLocalCache()
            }

            return {
                success: data.success,
                message: data.message || (data.success ? '登录成功' : '登录失败'),
                data: response.data || null
            }
        } catch (error) {
            console.error('登录请求失败:', error)
            return {
                success: false,
                message: handleApiError(error, '登录失败')
            }
        }
    }

    // 登出
    const logout = async () => {
        try {
            const response = await auth.logout()
            const data = normalizeApiResponse(response)

            // 登出成功时清除本地存储和缓存
            if (data.success) {
                clearStoredUser()
                clearLocalCache()
            }

            return {
                success: data.success,
                message: data.message || (data.success ? '登出成功' : '登出失败')
            }
        } catch (error) {
            console.error('登出请求失败:', error)
            // 即使服务器请求失败，也要清除本地存储和缓存
            clearStoredUser()
            clearLocalCache()
            return {
                success: false,
                message: handleApiError(error, '登出失败')
            }
        }
    }

    // 初始化认证状态
    const initAuth = async () => {
        // 这个方法可以在应用启动时调用
        return await checkLoginStatus()
    }

    return {
        checkLoginStatus,
        login,
        logout,
        initAuth,
        getStoredUser,
        clearLocalCache
    }
}