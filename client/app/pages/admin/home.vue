<script setup>
const router = useRouter()
const toast = useToast()

// Pinia store
const authStore = import.meta.client ? useAuthStore() : null
// 用户信息计算属性
const userInfo = computed(() => import.meta.client && authStore ? authStore.user : null)

// 加载状态
const loading = ref(true)

// 按需加载用户信息
onMounted(async () => {
    if (!import.meta.client) return

    try {
        // 并行执行用户信息
        await Promise.all([
            authStore.loadUserInfo(),
        ])
    } catch (err) {
        console.error('初始化失败:', err)
        toast.add({
            title: '加载失败',
            description: '初始化数据加载失败',
            color: 'red',
            icon: 'i-heroicons-exclamation-circle'
        })
    }
})

// 退出登录
const handleLogout = async () => {
    if (!import.meta.client) return

    try {
        const result = await authStore.logout()
        if (result.success) {
            toast.add({
                title: '退出成功',
                description: '您已成功退出登录',
                color: 'green',
                icon: 'i-heroicons-check-circle'
            })
            router.push('/login')
        } else {
            toast.add({
                title: '退出失败',
                description: result.message || '退出登录失败，请重试',
                color: 'red',
                icon: 'i-heroicons-exclamation-circle'
            })
        }
    } catch (error) {
        console.error('登出失败:', error)
        toast.add({
            title: '退出失败',
            description: '退出登录时发生错误，请重试',
            color: 'red',
            icon: 'i-heroicons-exclamation-circle'
        })
    }
}
</script>

<template>
    <div class="px-6 w-full max-w-(--ui-container) mx-auto">
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white">管理后台</h1>
            <p class="text-gray-600 dark:text-gray-400">欢迎来到管理后台仪表板</p>
        </div>

        <UAlert v-if="userInfo" :title="`你好, ${userInfo.name}!`"
            :description="`UID: ${userInfo.uid} 用户组: ${userInfo.group}`" :avatar="{ src: userInfo.avatar }"
            orientation="horizontal" variant="soft" color="success" class="mb-6">
            <template #actions>
                <UButton label="退出登录" color="neutral" variant="subtle" size="xs" @click="handleLogout" />
            </template>
        </UAlert>
    </div>
</template>

<style scoped>
.grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
</style>