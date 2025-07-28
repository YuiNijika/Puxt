/**
 * API配置文件
 * 集中管理所有API相关的配置
 */

export const API_CONFIG = {
    baseUrl: '/apiService',
    timeout: 10000,
    retryCount: 3,
    retryDelay: 1000,
    // SSR 环境下的配置
    ssr: {
        timeout: 5000,    // SSR 环境下更短的超时时间
        retryCount: 1,    // SSR环境下减少重试次数
        retryDelay: 500   // 更短的重试延迟
    }
}

// 缓存配置
export const CACHE_CONFIG = {
    USER_CACHE_DURATION: 5 * 60 * 1000 // 5分钟缓存
}