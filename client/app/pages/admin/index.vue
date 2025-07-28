<script setup>
const router = useRouter()
const authStore = import.meta.client ? useAuthStore() : null

onMounted(async () => {
    if (!import.meta.client) return

    try {
        // 检查用户登录状态
        const result = await authStore.checkAuthStatus()

        if (result.success && result.logged_in) {
            router.push('/admin/home')
        } else {
            router.push('/login')
        }
    } catch (error) {
        console.error('检查登录状态失败:', error)
        // 发生错误时默认跳转到登录页面
        router.push('/login')
    }
})
</script>

<template>
    <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4">
            </div>
            <p class="text-gray-600 dark:text-gray-400">正在检查登录状态...</p>
        </div>
    </div>
</template>

<style scoped>
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}
</style>