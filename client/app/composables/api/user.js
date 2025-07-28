/**
 * 用户相关API
 * 处理用户信息获取、更新等功能
 */

import { apiService } from './core.js'
import { handleApiError, normalizeApiResponse, storage, cacheManager } from './utils.js'
import { CACHE_CONFIG } from './config.js'

/**
 * 用户API接口
 */
export const userApi = {
    /**
     * 获取用户信息
     * @param {string} action - 操作类型
     * @returns {Promise} 用户信息
     */
    getUserInfo: (action = 'get') => {
        const params = action !== 'get' ? { action } : {}
        return apiService.get('user', params)
    },

    /**
     * 更新用户信息
     * @param {object} userData - 用户数据
     * @param {string} action - 操作类型
     * @returns {Promise} 更新结果
     */
    updateUser: (userData, action = 'put') => {
        const actionParam = action !== 'put' ? action : null
        return apiService.put('user', userData, actionParam)
    }
}

/**
 * 用户管理功能
 * 提供用户信息的缓存管理和本地存储
 */
export const useUserManager = () => {
    const USER_STORAGE_KEY = 'auth_user'
    const USER_CACHE_KEY = 'user_info'

    /**
     * 获取存储的用户信息
     * @returns {object|null} 存储的用户信息
     */
    const getStoredUser = () => {
        return storage.get(USER_STORAGE_KEY)
    }

    /**
     * 保存用户信息到本地存储
     * @param {object} user - 用户信息
     */
    const setStoredUser = (user) => {
        storage.set(USER_STORAGE_KEY, user)
    }

    /**
     * 清除存储的用户信息
     */
    const clearStoredUser = () => {
        storage.remove(USER_STORAGE_KEY)
    }

    /**
     * 清除本地缓存
     */
    const clearLocalCache = () => {
        cacheManager.delete(USER_CACHE_KEY)
    }

    /**
     * 获取用户信息
     * @param {boolean} force - 是否强制刷新
     * @returns {Promise<object>} 用户信息结果
     */
    const getUserInfo = async (force = false) => {
        const isSSR = import.meta.server
        
        // 检查缓存（仅在客户端且非强制刷新时）
        if (!isSSR && !force) {
            const cached = cacheManager.get(USER_CACHE_KEY)
            if (cached) {
                return cached
            }
        }

        try {
            const response = await userApi.getUserInfo()
            const data = normalizeApiResponse(response)

            if (data.success && response.data) {
                const result = {
                    success: true,
                    logged_in: true,
                    data: response.data,
                    message: data.message || '获取用户信息成功'
                }

                // 只在客户端环境下缓存
                if (!isSSR) {
                    cacheManager.set(USER_CACHE_KEY, result, CACHE_CONFIG.USER_CACHE_DURATION)
                }
                setStoredUser(response.data)
                return result
            } else {
                const result = {
                    success: data.success,
                    logged_in: false,
                    message: data.message || '用户未登录'
                }

                // 只在客户端环境下缓存
                if (!isSSR) {
                    cacheManager.set(USER_CACHE_KEY, result, CACHE_CONFIG.USER_CACHE_DURATION)
                }
                clearStoredUser()
                return result
            }
        } catch (error) {
            console.error('获取用户信息失败:', error)
            const errorResult = {
                success: false,
                logged_in: false,
                message: handleApiError(error, '获取用户信息失败')
            }
            
            if (error.status === 403 || error.status === 401) {
                clearStoredUser()
                clearLocalCache()
            }
            return errorResult
        }
    }

    /**
     * 更新用户信息
     * @param {object} userData - 用户数据
     * @returns {Promise<object>} 更新结果
     */
    const updateUserInfo = async (userData) => {
        try {
            const response = await userApi.updateUser(userData)
            const data = normalizeApiResponse(response)

            if (data.success && response.data) {
                setStoredUser(response.data)
                clearLocalCache()

                return {
                    success: true,
                    data: response.data,
                    message: data.message || '更新用户信息成功'
                }
            }

            return {
                success: data.success,
                message: data.message || '更新用户信息失败'
            }
        } catch (error) {
            console.error('更新用户信息失败:', error)
            return {
                success: false,
                message: handleApiError(error, '更新用户信息失败')
            }
        }
    }

    /**
     * 刷新用户信息缓存
     * @returns {Promise<object>} 刷新结果
     */
    const refreshUserInfo = async () => {
        return await getUserInfo(true)
    }

    return {
        getUserInfo,
        updateUserInfo,
        refreshUserInfo,
        getStoredUser,
        setStoredUser,
        clearStoredUser,
        clearLocalCache
    }
}