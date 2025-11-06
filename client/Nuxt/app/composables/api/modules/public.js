/**
 * 公开API
 * 处理无需认证的公开数据获取
 */

import { apiService } from '../core/ApiService.js'
import { handleApiError, normalizeApiResponse, cacheManager } from '../core/utils.js'
import { CACHE_CONFIG } from '../core/config.js'

/**
 * 公共API接口
 */
export const publicApi = {
    /**
     * 获取公开消息
     * @param {object} params - 查询参数
     * @returns {Promise} 消息数据
     */
    getSystemInfo: (params = {}) => {
        return apiService.get('/anon/common/system-info', params);
    },
}

/**
 * 公共资源管理功能
 */
export const usePublicManager = () => {
    /**
     * 获取留言列表
     * @param {Object} params - 查询参数
     * @returns {Promise} 留言列表数据
     */
    const getSystemInfo = async (params = {}) => {
        try {
            const response = await publicApi.getSystemInfo(params);
            return response;
        } catch (error) {
            handleApiError(error);
            throw error;
        }
    };

    return {
        getSystemInfo,
    };
}