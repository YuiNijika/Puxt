/**
 * 统一的API服务封装 - 主入口文件
 * 集中导出所有API相关功能
 */

// 导入核心模块
import { apiService } from './api/core.js'
import { authApi, useAuthManager } from './api/auth.js'
import { userApi, useUserManager } from './api/user.js'
import { handleApiError, normalizeApiResponse } from './api/utils.js'

// 重新导出所有API接口
export { authApi, userApi }

// 重新导出管理器
export { useAuthManager, useUserManager }

// 重新导出工具函数
export { handleApiError, normalizeApiResponse }

/**
 * 统一的API服务组合函数
 * 提供所有API功能的统一访问入口
 */
export const useApiService = () => {
    return {
        // 原始API服务实例
        apiService,

        // 分类API
        auth: authApi,
        user: userApi,

        // 便捷方法
        get: apiService.get.bind(apiService),
        post: apiService.post.bind(apiService),
        put: apiService.put.bind(apiService),
        delete: apiService.delete.bind(apiService),

        // 管理器
        authManager: useAuthManager(),
        userManager: useUserManager()
    }
}

// 默认导出
export default useApiService