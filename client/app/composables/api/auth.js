/**
 * 认证相关API
 * 处理登录、登出、权限检查等功能
 */

import { apiService } from './core.js'
import { handleApiError, normalizeApiResponse } from './utils.js'

/**
 * 认证API接口
 */
export const authApi = {
    /**
     * 检查登录状态
     * @param {string} action - 操作类型
     * @returns {Promise} 登录状态检查结果
     */
    checkLogin: (action = 'get') => {
        const params = action !== 'get' ? { action } : {}
        return apiService.get('auth/check-login', params)
    },

    /**
     * 用户登录
     * @param {object} credentials - 登录凭据
     * @param {string} action - 操作类型
     * @returns {Promise} 登录结果
     */
    login: (credentials, action = 'post') => {
        const actionParam = action !== 'post' ? action : null
        return apiService.post('auth/login', credentials, actionParam)
    },

    /**
     * 用户登出
     * @param {string} action - 操作类型
     * @returns {Promise} 登出结果
     */
    logout: (action = 'post') => {
        const actionParam = action !== 'post' ? action : null
        return apiService.post('auth/logout', {}, actionParam)
    }
}

/**
 * 认证管理功能
 * 提供高级认证操作和状态管理
 */
export const useAuthManager = () => {
    /**
     * 执行登录操作
     * @param {object} credentials - 登录凭据
     * @returns {Promise<object>} 登录结果
     */
    const login = async (credentials) => {
        try {
            const response = await authApi.login(credentials)
            const data = normalizeApiResponse(response)

            if (data.success) {
                return {
                    success: true,
                    data: response.data,
                    message: data.message || '登录成功'
                }
            }

            return {
                success: false,
                message: data.message || '登录失败'
            }
        } catch (error) {
            console.error('登录失败:', error)
            return {
                success: false,
                message: handleApiError(error, '登录失败')
            }
        }
    }

    /**
     * 执行登出操作
     * @returns {Promise<object>} 登出结果
     */
    const logout = async () => {
        try {
            const response = await authApi.logout()
            const data = normalizeApiResponse(response)

            return {
                success: data.success,
                message: data.message || (data.success ? '登出成功' : '登出失败')
            }
        } catch (error) {
            console.error('登出失败:', error)
            return {
                success: false,
                message: handleApiError(error, '登出失败')
            }
        }
    }

    /**
     * 检查登录状态
     * @returns {Promise<object>} 登录状态检查结果
     */
    const checkLoginStatus = async () => {
        try {
            const response = await authApi.checkLogin()
            const data = normalizeApiResponse(response)

            return {
                success: data.success,
                isLoggedIn: data.success && response.logged_in,
                data: response.data,
                message: data.message || '状态检查完成'
            }
        } catch (error) {
            console.error('检查登录状态失败:', error)
            return {
                success: false,
                isLoggedIn: false,
                message: handleApiError(error, '检查登录状态失败')
            }
        }
    }

    return {
        login,
        logout,
        checkLoginStatus
    }
}