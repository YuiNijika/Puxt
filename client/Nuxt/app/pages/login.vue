<script setup>
import { useUserManager } from '~/composables/useApiService.js'

useSeoMeta({
    title: '登录',
})

const router = useRouter()
const { login } = useAuth()
const { getUserInfo } = useUserManager()
const authStore = import.meta.client ? useAuthStore() : null

const toast = useToast()

// 表单数据
const form = reactive({
    username: '',
    password: '',
    rememberMe: false
})

// 状态管理
const loading = ref(false)
const error = ref('')

// 检查用户是否已经登录
onMounted(async () => {
    if (!import.meta.client) return
    
    try {
        const result = await authStore.checkAuthStatus()
        if (result.success && result.logged_in) {
            // 用户已登录，重定向到管理后台
            router.push('/admin')
        }
    } catch (err) {
        console.error('检查登录状态失败:', err)
    }
})

// 处理登录
const handleLogin = async () => {
    // 重置错误信息
    error.value = ''

    // 基本验证
    if (!form.username.trim() || !form.password) {
        toast.add({
            title: '登录失败',
            description: '用户名和密码不能为空',
            color: 'red',
            icon: 'i-heroicons-exclamation-circle'
        })
        return
    }

    loading.value = true

    try {
        const data = await login({
            username: form.username,
            password: form.password,
            rememberMe: form.rememberMe
        })

        if (data.success) {
            // 登录成功消息提示
            toast.add({
                title: '登录成功',
                description: '欢迎回来，正在跳转到首页',
                color: 'green',
                icon: 'i-heroicons-check-circle'
            })
            
            // 登录成功，获取完整的用户信息
            if (import.meta.client && authStore) {
                // 直接请求 useUser 获取用户信息
                const userInfoResult = await getUserInfo()
                if (userInfoResult.success && userInfoResult.logged_in) {
                    authStore.setUser(userInfoResult.data)
                    authStore.initialized = true
                }
            }
            // 延迟跳转以显示成功消息
            setTimeout(() => {
                router.push('/')
            }, 500)
        } else {
            // 显示错误信息
            error.value = data.message || '登录失败'
            toast.add({
                title: '登录失败',
                description: data.message || '登录失败，请检查用户名和密码',
                color: 'red',
                icon: 'i-heroicons-exclamation-circle'
            })
        }
    } catch (err) {
        console.error('登录请求失败:', err)
        error.value = '网络错误，请稍后再试'
        toast.add({
            title: '网络错误',
            description: '登录时发生网络错误，请稍后再试',
            color: 'red',
            icon: 'i-heroicons-exclamation-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div class="w-full max-w-md">
            <div class="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-800 dark:text-white">登录</h1>
                    <p class="text-gray-600 dark:text-gray-300 mt-2">
                        <!-- 如果没有账号可以<span class="text-blue-500 font-medium">前往注册</span> -->
                        小哥小哥, 赶快<span class="text-blue-500 font-medium">登录</span>罢
                    </p>
                </div>

                <form @submit.prevent="handleLogin">
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" for="username">
                            用户名
                        </label>
                        <input id="username" v-model="form.username"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            type="text" placeholder="请输入用户名" required />
                    </div>

                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" for="password">
                            密码
                        </label>
                        <input id="password" v-model="form.password"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            type="password" placeholder="请输入密码" required />
                    </div>

                    <div class="mb-4 flex items-center">
                        <input id="rememberMe" v-model="form.rememberMe" type="checkbox"
                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label for="rememberMe" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            记住我
                        </label>
                    </div>

                    <div v-if="error" class="mb-4">
                        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                            role="alert">
                            <span class="block sm:inline">{{ error }}</span>
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <button
                            class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center"
                            type="submit" :disabled="loading">
                            <span v-if="loading" class="mr-2">
                                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                                    fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                            </span>
                            {{ loading ? '登录中...' : '登录' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>