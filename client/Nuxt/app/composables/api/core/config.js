/**
 * API配置文件
 * 集中管理所有API相关的配置
 * 支持多环境配置和运行时配置
 */

import { useRuntimeConfig } from '#imports'

// 运行时配置
const getBaseUrl = () => {
    const config = useRuntimeConfig()
    // 如果配置了完整的API URL，优先使用
    if (config.public.apiUrl) {
        return config.public.apiUrl
    }
    // 否则使用相对路径
    return config.public.apiBase || '/api'
}

// 判断是否为跨域请求
const isCrossOrigin = () => {
    const baseUrl = getBaseUrl()
    return baseUrl.startsWith('http://') || baseUrl.startsWith('https://')
}

export const API_CONFIG = {
    // 获取baseUrl
    getBaseUrl() {
        return getBaseUrl()
    },

    // 判断是否为跨域请求
    isCrossOrigin() {
        return isCrossOrigin()
    },

    timeout: 10000,
    retryCount: 3,
    retryDelay: 1000,

    // SSR 环境下的配置
    ssr: {
        timeout: 5000,
        retryCount: 1,
        retryDelay: 500
    },

    // 请求头配置
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}

// 缓存配置
export const CACHE_CONFIG = {
    USER_CACHE_DURATION: 5 * 60 * 1000
}

// 环境检测
export const ENV = {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    isSSR: import.meta.server,
    isClient: import.meta.client
}