/**
 * API拦截器工具
 * 提供常用的请求和响应拦截器
 */

import { ENV } from '../core/config.js'

/**
 * 认证拦截器 - 自动添加认证token
 */
export const authInterceptor = async (config) => {
    if (import.meta.client) {
        try {
            // 尝试从localStorage获取token
            const token = localStorage.getItem('auth_token')
            if (token) {
                config.options.headers = {
                    ...config.options.headers,
                    'Authorization': `Bearer ${token}`
                }
            }
        } catch (error) {
            console.warn('添加认证token失败:', error)
        }
    }
    return config
}

/**
 * 日志拦截器 - 记录请求和响应日志
 */
export const loggingInterceptor = async (config) => {
    if (ENV.isDevelopment) {
        console.log(`[API Request] ${config.options.method} ${config.url}`, {
            headers: config.options.headers,
            body: config.options.body
        })
    }
    return config
}

/**
 * 响应日志拦截器
 */
export const responseLoggingInterceptor = async (response, config) => {
    if (ENV.isDevelopment) {
        console.log(`[API Response] ${config.options.method} ${config.url}`, response)
    }
    return response
}

/**
 * 错误处理拦截器 - 统一处理错误响应
 */
export const errorHandlerInterceptor = async (response, config) => {
    if (response && typeof response === 'object') {
        // 处理标准的错误响应格式
        if (!response.success && response.message) {
            console.error(`API Error [${config.url}]:`, response.message)

            // 如果是认证错误，清除本地存储
            if (response.status === 401 || response.message.includes('未授权')) {
                if (import.meta.client) {
                    localStorage.removeItem('auth_token')
                    localStorage.removeItem('auth_user')
                }
            }
        }
    }
    return response
}

/**
 * CSRF保护拦截器
 */
export const csrfInterceptor = async (config) => {
    if (import.meta.client && !config.isCrossOrigin) {
        // 对于同源请求，尝试添加CSRF token
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content
            if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.options.method)) {
                config.options.headers = {
                    ...config.options.headers,
                    'X-CSRF-TOKEN': csrfToken
                }
            }
        } catch (error) {
            console.warn('添加CSRF token失败:', error)
        }
    }
    return config
}

/**
 * 超时拦截器 - 处理超时错误
 */
export const timeoutInterceptor = async (response, config) => {
    if (response && response.timeout) {
        console.warn(`请求超时: ${config.url}`)
        // 可以在这里添加重试逻辑或其他处理
    }
    return response
}

/**
 * 默认拦截器集合
 */
export const defaultInterceptors = {
    request: [csrfInterceptor, authInterceptor, loggingInterceptor],
    response: [responseLoggingInterceptor, errorHandlerInterceptor, timeoutInterceptor]
}

/**
 * 注册默认拦截器到API服务
 * @param {ApiService} apiService - API服务实例
 */
export const registerDefaultInterceptors = (apiService) => {
    defaultInterceptors.request.forEach(interceptor => {
        apiService.addRequestInterceptor(interceptor)
    })

    defaultInterceptors.response.forEach(interceptor => {
        apiService.addResponseInterceptor(interceptor)
    })
}

/**
 * 创建自定义拦截器
 * @param {function} beforeRequest - 请求前处理函数
 * @param {function} afterResponse - 响应后处理函数
 */
export const createInterceptor = (beforeRequest, afterResponse) => ({
    beforeRequest,
    afterResponse
})