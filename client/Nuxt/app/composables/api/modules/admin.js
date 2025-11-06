/**
 * 管理员相关API
 * 处理管理员功能
 */

import { apiService } from '../core/ApiService'
import { handleApiError, normalizeApiResponse } from '../core/utils.js'

/**
 * 管理员API接口
 */
export const adminApi = {
    /**
     * 获取统计数据
     * @returns {Promise} 统计数据
     */
    getStatistics: () => {
        return apiService.get('admin/statistics');
    },

    /**
     * 获取成员列表
     * @param {object} params - 查询参数
     * @returns {Promise} 成员列表
     */
    getMembers: (params = {}) => {
        return apiService.get('admin/member', params);
    },

    /**
     * 更新成员信息
     * @param {object} memberData - 成员数据
     * @returns {Promise} 更新结果
     */
    updateMember: (memberData) => {
        return apiService.put('admin/member', memberData);
    },

    /**
     * 删除成员
     * @param {number} id - 成员ID
     * @returns {Promise} 删除结果
     */
    deleteMember: (id) => {
        // 使用POST方法发送删除请求，通过_method参数指定实际操作
        return apiService.post('admin/member', {
            id: id,
            _method: 'delete'
        });
    },

    /**
     * 获取留言列表
     * @param {object} params - 查询参数
     * @returns {Promise} 留言列表
     */
    getMessages: (params = {}) => {
        return apiService.get('admin/message', params);
    },

    /**
     * 更新留言
     * @param {object} messageData - 留言数据
     * @returns {Promise} 更新结果
     */
    updateMessage: (messageData) => {
        return apiService.put('admin/message', messageData);
    },

    /**
     * 删除留言
     * @param {number} id - 留言ID
     * @returns {Promise} 删除结果
     */
    deleteMessage: (id) => {
        return apiService.delete('admin/message', { id });
    },
}

/**
 * 管理员管理功能
 */
export const useAdminManager = () => {
    /**
     * 获取统计数据
     * @returns {Promise<object>} 统计数据结果
     */
    const getStatistics = async () => {
        try {
            const response = await adminApi.getStatistics();
            const data = normalizeApiResponse(response);

            return {
                success: data.success,
                data: data.data || { messageCount: 0, memberCount: 0, articleCount: 0 },
                message: data.message || (data.success ? '获取统计数据成功' : '获取统计数据失败')
            };
        } catch (error) {
            console.error('获取统计数据失败:', error);
            return {
                success: false,
                data: { messageCount: 0, memberCount: 0, articleCount: 0 },
                message: handleApiError(error, '获取统计数据失败')
            };
        }
    };

    /**
     * 获取成员列表
     * @param {object} params - 查询参数
     * @returns {Promise<object>} 成员列表结果
     */
    const getMembers = async (params = {}) => {
        try {
            const response = await adminApi.getMembers(params);
            const data = normalizeApiResponse(response);

            return {
                success: data.success,
                data: data.data?.members || data.data || [],
                pagination: data.pagination || { page: 1, size: 15, total: 0, pages: 1 },
                message: data.message || (data.success ? '获取成员列表成功' : '获取成员列表失败')
            };
        } catch (error) {
            console.error('获取成员列表失败:', error);
            return {
                success: false,
                data: [],
                pagination: { page: 1, size: 15, total: 0, pages: 1 },
                message: handleApiError(error, '获取成员列表失败')
            };
        }
    };

    /**
     * 更新成员信息
     * @param {object} memberData - 成员数据
     * @returns {Promise<object>} 更新结果
     */
    const updateMember = async (memberData) => {
        try {
            const response = await adminApi.updateMember(memberData);
            const data = normalizeApiResponse(response);

            return {
                success: data.success,
                data: data.data,
                message: data.message || (data.success ? '成员信息已更新' : '更新成员信息失败')
            };
        } catch (error) {
            console.error('更新成员信息失败:', error);
            return {
                success: false,
                message: handleApiError(error, '更新成员信息失败')
            };
        }
    };

    /**
     * 删除成员
     * @param {number} id - 成员ID
     * @returns {Promise<object>} 删除结果
     */
    const deleteMember = async (id) => {
        try {
            const response = await adminApi.deleteMember(id);
            const data = normalizeApiResponse(response);

            return {
                success: data.success,
                data: data.data,
                message: data.message || (data.success ? '成员已删除' : '删除成员失败')
            };
        } catch (error) {
            console.error('删除成员失败:', error);
            return {
                success: false,
                message: handleApiError(error, '删除成员失败')
            };
        }
    };

    /**
     * 获取留言列表
     * @param {object} params - 查询参数
     * @returns {Promise<object>} 留言列表结果
     */
    const getMessages = async (params = {}) => {
        try {
            const response = await adminApi.getMessages(params);
            const data = normalizeApiResponse(response);

            return {
                success: data.success,
                data: data.data?.messages || data.data || [],
                pagination: data.pagination || { page: 1, size: 15, total: 0, pages: 1 },
                message: data.message || (data.success ? '获取留言列表成功' : '获取留言列表失败')
            };
        } catch (error) {
            console.error('获取留言列表失败:', error);
            return {
                success: false,
                data: [],
                pagination: { page: 1, size: 15, total: 0, pages: 1 },
                message: handleApiError(error, '获取留言列表失败')
            };
        }
    };

    /**
     * 更新留言
     * @param {object} messageData - 留言数据
     * @returns {Promise<object>} 更新结果
     */
    const updateMessage = async (messageData) => {
        try {
            const response = await adminApi.updateMessage(messageData);
            const data = normalizeApiResponse(response);

            return {
                success: data.success,
                data: data.data,
                message: data.message || (data.success ? '留言已更新' : '更新留言失败')
            };
        } catch (error) {
            console.error('更新留言失败:', error);
            return {
                success: false,
                message: handleApiError(error, '更新留言失败')
            };
        }
    };

    /**
     * 删除留言
     * @param {number} id - 留言ID
     * @returns {Promise<object>} 删除结果
     */
    const deleteMessage = async (id) => {
        try {
            const response = await adminApi.deleteMessage(id);
            const data = normalizeApiResponse(response);

            return {
                success: data.success,
                data: data.data,
                message: data.message || (data.success ? '留言已删除' : '删除留言失败')
            };
        } catch (error) {
            console.error('删除留言失败:', error);
            return {
                success: false,
                message: handleApiError(error, '删除留言失败')
            };
        }
    };

    return {
        getStatistics,
        // 成员管理
        getMembers,
        updateMember,
        deleteMember,

        // 留言管理
        getMessages,
        updateMessage,
        deleteMessage,
    };
};