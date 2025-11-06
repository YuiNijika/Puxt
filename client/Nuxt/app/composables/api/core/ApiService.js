/**
 * 核心API服务类
 * 提供基础的HTTP请求功能和重试机制
 */

import { API_CONFIG, ENV } from './config.js'
import { registerDefaultInterceptors } from '../interceptors/index.js'

class ApiService {
    constructor() {
        this.baseUrl = ''
        this.isCrossOrigin = false
        this.requestInterceptors = []
        this.responseInterceptors = []
        this._initialized = false
        
        // 自动注册默认拦截器
        registerDefaultInterceptors(this)
    }

    /**
     * 初始化API服务配置
     */
    async init() {
        if (!this._initialized) {
            this.baseUrl = API_CONFIG.getBaseUrl()
            this.isCrossOrigin = API_CONFIG.isCrossOrigin()
            this._initialized = true
        }
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * 添加请求拦截器
     * @param {function} interceptor - 拦截器函数
     */
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor)
    }

    /**
     * 添加响应拦截器
     * @param {function} interceptor - 拦截器函数
     */
    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor)
    }

    /**
     * 执行请求拦截器
     * @param {object} config - 请求配置
     * @returns {object} 处理后的配置
     */
    async _executeRequestInterceptors(config) {
        let processedConfig = { ...config }
        for (const interceptor of this.requestInterceptors) {
            processedConfig = await interceptor(processedConfig) || processedConfig
        }
        return processedConfig
    }

    /**
     * 执行响应拦截器
     * @param {object} response - 响应对象
     * @param {object} config - 请求配置
     * @returns {object} 处理后的响应
     */
    async _executeResponseInterceptors(response, config) {
        let processedResponse = response
        for (const interceptor of this.responseInterceptors) {
            processedResponse = await interceptor(processedResponse, config) || processedResponse
        }
        return processedResponse
    }

    /**
     * 基础请求方法
     * @param {string} endpoint - API端点
     * @param {object} options - 请求选项
     * @returns {Promise} 请求结果
     */
    async request(endpoint, options = {}) {
        // 确保API服务已初始化
        if (!this._initialized) {
            await this.init()
        }
        
        // 修复baseUrl处理逻辑
        const cleanEndpoint = endpoint.replace(/^\//, '')
        const url = `${this.baseUrl}/${cleanEndpoint}`
        const isSSR = import.meta.server

        // 根据环境选择配置
        const config = isSSR ? API_CONFIG.ssr : API_CONFIG
        const { timeout, retryCount, retryDelay } = config

        const defaultOptions = {
            method: 'GET',
            credentials: this.isCrossOrigin ? 'omit' : 'include',
            headers: {
                ...API_CONFIG.headers,
                ...options.headers
            },
            ...options
        }

        // 执行请求拦截器
        const processedOptions = await this._executeRequestInterceptors({
            url,
            endpoint,
            options: defaultOptions,
            isSSR
        })

        // 添加重试机制
        let lastError
        for (let i = 0; i < retryCount; i++) {
            try {
                // 在SSR环境下使用$fetch以确保兼容性
            if (isSSR) {
                const response = await this._handleSSRRequest(processedOptions.url, processedOptions.options, endpoint)
                return await this._executeResponseInterceptors(response, processedOptions)
            } else {
                const response = await this._handleClientRequest(processedOptions.url, processedOptions.options, timeout)
                return await this._executeResponseInterceptors(response, processedOptions)
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
        // 在SSR环境下确保使用绝对URL
        const response = await $fetch(fullUrl, fetchOptions)
        return response
    }

    /**
     * 处理客户端环境下的请求
     */
    async _handleClientRequest(url, defaultOptions, timeout) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        try {
            // 构建完整的URL，包括查询参数
            let fullUrl = url
            if (defaultOptions.params) {
                const searchParams = new URLSearchParams(defaultOptions.params)
                const queryString = searchParams.toString()
                if (queryString) {
                    fullUrl += (url.includes('?') ? '&' : '?') + queryString
                }
            }

            // 准备请求选项
            const fetchOptions = {
                method: defaultOptions.method,
                headers: defaultOptions.headers,
                signal: controller.signal,
                credentials: this.isCrossOrigin ? 'omit' : 'include'
            }

            // 对于POST、PUT等请求，添加body
            if (defaultOptions.body) {
                fetchOptions.body = defaultOptions.body
            }

            const response = await fetch(fullUrl, fetchOptions)

            clearTimeout(timeoutId)

            // 处理特定的HTTP状态码
            if (response.status === 401) {
                // 触发登出逻辑
                if (import.meta.client) {
                    try {
                        const { useAuthStore } = await import('../../stores/useAuthStore.js')
                        const authStore = useAuthStore()
                        await authStore.logout()
                    } catch (e) {
                        console.warn('登出逻辑执行失败:', e)
                    }
                }
                throw new Error('未授权访问')
            }

            const contentType = response.headers.get('content-type')
            let responseData
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json()
            } else {
                // 如果响应不是JSON格式，返回一个标准格式
                responseData = {
                    success: response.ok,
                    data: await response.text()
                }
            }

            // 如果响应不成功，抛出错误
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`, {
                    cause: {
                        status: response.status,
                        data: responseData
                    }
                })
            }

            return responseData
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
        
        // 对于统计信息请求
        if (endpoint.includes('statistics')) {
            return {
                success: true,
                data: {
                    messageCount: 0,
                    memberCount: 0
                },
                message: 'SSR 环境下使用默认数据'
            }
        }
        
        // 对于消息和成员请求
        if (endpoint.includes('message') || endpoint.includes('member')) {
            return {
                success: true,
                data: [],
                pagination: { page: 1, limit: 15, total: 0, pages: 1 },
                message: 'SSR 环境下使用默认数据'
            }
        }
        
        // 对于提交文章请求，返回错误
        if (endpoint.includes('article-submit')) {
            throw new Error('SSR 环境下无法提交文章')
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
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
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
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
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