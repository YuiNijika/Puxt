/**
 * API服务使用示例
 * 展示如何使用重构后的API模块
 */

// ===== 基础使用示例 =====

// 方式1: 使用统一的API服务
import { useApiService } from '../useApiService.js'

export const basicUsageExample = async () => {
    const api = useApiService()
    
    // 基础HTTP请求
    const data = await api.get('some-endpoint')
    const result = await api.post('another-endpoint', { key: 'value' })
    
    // 使用分类API
    const loginResult = await api.auth.login({ username: 'user', password: 'pass' })
    const userInfo = await api.user.getUserInfo()
    
    return { data, result, loginResult, userInfo }
}

// ===== 认证管理示例 =====

import { useAuthManager } from '../useApiService.js'

export const authExample = async () => {
    const authManager = useAuthManager()
    
    // 登录
    const loginResult = await authManager.login({
        username: 'testuser',
        password: 'testpass'
    })
    
    if (loginResult.success) {
        console.log('登录成功:', loginResult.message)
        
        // 检查登录状态
        const status = await authManager.checkLoginStatus()
        console.log('登录状态:', status.isLoggedIn)
        
        // 登出
        const logoutResult = await authManager.logout()
        console.log('登出结果:', logoutResult.message)
    } else {
        console.error('登录失败:', loginResult.message)
    }
    
    return loginResult
}

// ===== 用户管理示例 =====

import { useUserManager } from '../useApiService.js'

export const userExample = async () => {
    const userManager = useUserManager()
    
    // 获取用户信息（带缓存）
    const userInfo = await userManager.getUserInfo()
    
    if (userInfo.success && userInfo.logged_in) {
        console.log('用户信息:', userInfo.data)
        
        // 更新用户信息
        const updateResult = await userManager.updateUserInfo({
            name: '新用户名',
            email: 'new@example.com'
        })
        
        if (updateResult.success) {
            console.log('更新成功:', updateResult.data)
            
            // 刷新用户信息
            const refreshedInfo = await userManager.refreshUserInfo()
            console.log('刷新后的用户信息:', refreshedInfo.data)
        }
    } else {
        console.log('用户未登录或获取信息失败')
    }
    
    return userInfo
}

// ===== 错误处理示例 =====

import { handleApiError, normalizeApiResponse } from '../useApiService.js'

export const errorHandlingExample = async () => {
    try {
        // 模拟API调用
        const response = await fetch('/api/some-endpoint')
        const data = await response.json()
        
        // 标准化响应
        const normalizedData = normalizeApiResponse(data)
        
        if (normalizedData.success) {
            console.log('请求成功:', normalizedData)
        } else {
            console.error('请求失败:', normalizedData.message)
        }
        
        return normalizedData
    } catch (error) {
        // 统一错误处理
        const errorMessage = handleApiError(error, '请求失败')
        console.error('错误:', errorMessage)
        
        return {
            success: false,
            message: errorMessage
        }
    }
}

// ===== 缓存管理示例 =====

import { cacheManager } from '../useApiService.js'

export const cacheExample = () => {
    // 设置缓存
    cacheManager.set('user_preferences', { theme: 'dark', language: 'zh' }, 10 * 60 * 1000) // 10分钟
    
    // 获取缓存
    const preferences = cacheManager.get('user_preferences')
    console.log('用户偏好:', preferences)
    
    // 检查缓存是否存在
    if (cacheManager.has('user_preferences')) {
        console.log('缓存存在')
    }
    
    // 删除特定缓存
    cacheManager.delete('user_preferences')
    
    // 清空所有缓存
    // cacheManager.clear()
}

// ===== 本地存储示例 =====

import { storage } from '../useApiService.js'

export const storageExample = () => {
    // 存储数据
    storage.set('app_settings', { notifications: true, autoSave: false })
    
    // 获取数据
    const settings = storage.get('app_settings')
    console.log('应用设置:', settings)
    
    // 删除数据
    storage.remove('app_settings')
}

// ===== 组合使用示例 =====

export const combinedExample = async () => {
    const api = useApiService()
    const authManager = api.authManager
    const userManager = api.userManager
    
    try {
        // 1. 检查登录状态
        const loginStatus = await authManager.checkLoginStatus()
        
        if (!loginStatus.isLoggedIn) {
            // 2. 如果未登录，执行登录
            const loginResult = await authManager.login({
                username: 'user',
                password: 'pass'
            })
            
            if (!loginResult.success) {
                throw new Error(loginResult.message)
            }
        }
        
        // 3. 获取用户信息
        const userInfo = await userManager.getUserInfo()
        
        if (userInfo.success) {
            console.log('当前用户:', userInfo.data)
            
            // 4. 执行其他API操作
            const someData = await api.get('dashboard-data')
            
            return {
                success: true,
                user: userInfo.data,
                data: someData
            }
        }
        
    } catch (error) {
        const errorMessage = handleApiError(error, '操作失败')
        console.error('组合操作失败:', errorMessage)
        
        return {
            success: false,
            message: errorMessage
        }
    }
}