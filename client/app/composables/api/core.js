/**
 * 核心API服务类
 * 提供基础的HTTP请求功能和重试机制
 */

import { API_CONFIG } from './config.js'

export class ApiService {
    constructor() {
        this.baseUrl = API_CONFIG.baseUrl
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * 基础请求方法
     * @param {string} endpoint - API端点
     * @param {object} options - 请求选项
     * @returns {Promise} 请求结果
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`
        const isSSR = import.meta.server

        // 根据环境选择配置
        const config = isSSR ? API_CONFIG.ssr : API_CONFIG
        const { timeout, retryCount, retryDelay } = config

        const defaultOptions = {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        }

        // 添加重试机制
        let lastError
        for (let i = 0; i < retryCount; i++) {
            try {
                // 在SSR环境下使用$fetch以确保兼容性
                if (isSSR) {
                    return await this._handleSSRRequest(url, defaultOptions, endpoint)
                } else {
                    return await this._handleClientRequest(url, defaultOptions, timeout)
                }
            } catch (error) {
                lastError = error
                const envLabel = isSSR ? 'SSR' : 'Client'
                console.error(`API请求失败 [${endpoint}] (${envLabel} 第${i + 1}次尝试):`, error)

                // SSR 环境下减少重试次数
                if (isSSR && i === 0) {
                    console.warn(`SSR 环境下 API 请求失败，返回默认数据: ${endpoint}`)
                    return this._getSSRFallbackData(endpoint)
                }

                // 如果是最后一次重试，抛出错误
                if (i === retryCount - 1) {
                    throw lastError
                }

                // 计算重试延迟
                await this._handleRetryDelay(error, i, retryDelay)
            }
        }
    }

    /**
     * 处理SSR环境下的请求
     */
    async _handleSSRRequest(url, defaultOptions, endpoint) {
        // 移除浏览器特定的选项
        const fetchOptions = { ...defaultOptions }
        delete fetchOptions.signal
        delete fetchOptions.credentials

        const queryString = new URLSearchParams(defaultOptions.params || {}).toString()
        const fullUrl = queryString ? `${url}?${queryString}` : url

        console.log(`[SSR] 使用 $fetch 请求: ${fullUrl}`, fetchOptions)
        return await $fetch(fullUrl, fetchOptions)
    }

    /**
     * 处理客户端环境下的请求
     */
    async _handleClientRequest(url, defaultOptions, timeout) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        try {
            const response = await fetch(url, {
                ...defaultOptions,
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            // 处理特定的HTTP状态码
            if (response.status === 401) {
                // 触发登出逻辑
                if (import.meta.client) {
                    const { useAuthStore } = await import('../useAuthStore.js')
                    const authStore = useAuthStore()
                    await authStore.logout()
                }
                throw new Error('未授权访问')
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } finally {
            clearTimeout(timeoutId)
        }
    }

    /**
     * 获取SSR环境下的回退数据
     */
    _getSSRFallbackData(endpoint) {
        // 对于文章列表请求，返回空数据而不是抛出错误
        if (endpoint.includes('article')) {
            return {
                success: true,
                data: {
                    articles: [],
                    pagination: { page: 1, limit: 10, total: 0, pages: 1 }
                },
                message: 'SSR 环境下使用默认数据'
            }
        }
        throw new Error('SSR 环境下请求失败')
    }

    /**
     * 处理重试延迟
     */
    async _handleRetryDelay(error, retryIndex, baseRetryDelay) {
        // 对于网络错误和超时错误，增加重试延迟
        const isNetworkError = error.name === 'AbortError' || error.message.includes('Failed to fetch')
        const currentRetryDelay = isNetworkError 
            ? baseRetryDelay * Math.pow(2, retryIndex) * 2 
            : baseRetryDelay * Math.pow(2, retryIndex)

        console.log(`等待 ${currentRetryDelay}ms 后重试...`)
        await this.delay(currentRetryDelay)
    }

    /**
     * GET请求
     */
    async get(endpoint, params = {}) {
        return this.request(endpoint, {
            method: 'GET',
            params: params
        })
    }

    /**
     * POST请求
     */
    async post(endpoint, data = {}, action = null) {
        const params = action ? { action } : {}

        return this.request(endpoint, {
            method: 'POST',
            params: params,
            body: JSON.stringify(data)
        })
    }

    /**
     * PUT请求
     */
    async put(endpoint, data = {}, action = null) {
        const params = action ? { action } : {}

        return this.request(endpoint, {
            method: 'PUT',
            params: params,
            body: JSON.stringify(data)
        })
    }

    /**
     * DELETE请求
     */
    async delete(endpoint, action = null) {
        const params = action ? { action } : {}

        return this.request(endpoint, {
            method: 'DELETE',
            params: params
        })
    }
}

// 创建API服务实例
export const apiService = new ApiService()