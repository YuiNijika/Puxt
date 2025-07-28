/**
 * API工具函数
 * 提供错误处理、响应标准化等通用功能
 */

/**
 * 错误处理函数
 * @param {Error} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 * @returns {string} 处理后的错误消息
 */
export const handleApiError = (error, defaultMessage) => {
    if (error.name === 'AbortError') {
        return '请求超时，请检查网络连接'
    }

    if (error.message.includes('Failed to fetch')) {
        return '网络连接失败，请检查网络设置'
    }

    return defaultMessage || error.message || '未知错误'
}

/**
 * 标准化API响应
 * @param {object} response - API响应对象
 * @returns {object} 标准化后的响应
 */
export const normalizeApiResponse = (response) => {
    if (!response) {
        return {
            success: false,
            message: '服务器无响应'
        }
    }

    return {
        success: response.success ?? false,
        message: response.message || response.error || null,
        ...response
    }
}

/**
 * 本地存储管理
 */
export const storage = {
    /**
     * 获取存储的数据
     * @param {string} key - 存储键
     * @returns {any} 存储的数据
     */
    get(key) {
        if (import.meta.client) {
            const stored = localStorage.getItem(key)
            return stored ? JSON.parse(stored) : null
        }
        return null
    },

    /**
     * 设置存储数据
     * @param {string} key - 存储键
     * @param {any} value - 要存储的数据
     */
    set(key, value) {
        if (import.meta.client && value) {
            localStorage.setItem(key, JSON.stringify(value))
        }
    },

    /**
     * 移除存储数据
     * @param {string} key - 存储键
     */
    remove(key) {
        if (import.meta.client) {
            localStorage.removeItem(key)
        }
    }
}

/**
 * 缓存管理
 */
export class CacheManager {
    constructor() {
        this.cache = new Map()
    }

    /**
     * 设置缓存
     * @param {string} key - 缓存键
     * @param {any} value - 缓存值
     * @param {number} duration - 缓存持续时间（毫秒）
     */
    set(key, value, duration = 5 * 60 * 1000) {
        const expireTime = Date.now() + duration
        this.cache.set(key, { value, expireTime })
    }

    /**
     * 获取缓存
     * @param {string} key - 缓存键
     * @returns {any} 缓存值或null
     */
    get(key) {
        const cached = this.cache.get(key)
        if (!cached) return null

        if (Date.now() > cached.expireTime) {
            this.cache.delete(key)
            return null
        }

        return cached.value
    }

    /**
     * 删除缓存
     * @param {string} key - 缓存键
     */
    delete(key) {
        this.cache.delete(key)
    }

    /**
     * 清空所有缓存
     */
    clear() {
        this.cache.clear()
    }

    /**
     * 检查缓存是否存在且未过期
     * @param {string} key - 缓存键
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) !== null
    }
}

// 创建全局缓存管理器实例
export const cacheManager = new CacheManager()