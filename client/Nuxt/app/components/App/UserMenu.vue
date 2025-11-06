<script setup>
import { useUserManager } from '~/composables/useApiService.js'
import { useAuthStore } from '~/composables/stores/useAuthStore.js'

const authStore = import.meta.client ? useAuthStore() : null
const router = useRouter()
const toast = useToast()

// 获取用户信息
const userInfo = computed(() => import.meta.client && authStore ? authStore.user : null)

// 用户信息加载状态
const userInfoLoading = ref(false)

// 登录状态响应式变量
const isLoggedIn = ref(false)
const loginStatusLoading = ref(true)

// 获取用户信息的方法
const fetchUserInfo = async (force = false) => {
    if (!import.meta.client) return false

    // 如果已经有用户信息且不是强制刷新，直接返回
    if (!force && authStore.user) {
        return true
    }

    try {
        userInfoLoading.value = true
        const { getUserInfo } = useUserManager()
        const result = await getUserInfo(force)

        if (result.success && result.logged_in) {
            authStore.setUser(result.data)
            return true
        } else if (result.success && !result.logged_in) {
            authStore.clearUser()
            return false
        }
    } catch (error) {
        console.error('获取用户信息失败:', error)
    } finally {
        userInfoLoading.value = false
    }
    return false
}

// 检查登录状态并更新响应式变量
const checkLoginStatus = async () => {
    if (!import.meta.client) return false

    try {
        loginStatusLoading.value = true
        // 使用 authStore 检查登录状态，但不加载用户信息
        const result = await authStore.checkAuthStatus()
        isLoggedIn.value = result.success && result.logged_in
        return isLoggedIn.value
    } catch (error) {
        console.error('检查登录状态失败:', error)
        isLoggedIn.value = false
        return false
    } finally {
        loginStatusLoading.value = false
    }
}

// 在组件挂载时检查登录状态，如果已登录则自动获取用户信息
onMounted(async () => {
    if (!import.meta.client) return

    // 检查登录状态
    const result = await checkLoginStatus()

    // 如果已登录，自动获取用户信息
    if (result) {
        await fetchUserInfo()
    }
})

// 当用户点击头像时获取用户信息（作为备用或强制刷新）
const handleAvatarClick = async () => {
    if (!import.meta.client) return

    // 获取用户信息（如果已有信息则强制刷新）
    await fetchUserInfo(!authStore.user)
}

// 退出登录方法
const handleLogout = async () => {
    if (!import.meta.client) return

    try {
        const result = await authStore.logout()
        if (result.success) {
            // 更新登录状态
            isLoggedIn.value = false
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

// 菜单项定义
const items = computed(() => {
    const baseItems = [
        [
            {
                label: userInfo.value ? userInfo.value.name : '未登录',
                avatar: {
                    src: userInfo.value ? userInfo.value.avatar : '/images/Azusa.jpg'
                },
                type: 'label'
            }
        ]
    ]

    // 判断是否为管理员
    if (authStore?.isAuthenticated && userInfo.value?.group === 'admin') {
        baseItems.push([
            {
                label: '管理后台',
                icon: 'i-lucide-user',
                to: '/admin',
                kbds: ['Admin']
            }
        ])
    }

    baseItems.push([
        {
            label: '退出登录',
            icon: 'i-lucide-log-out',
            kbds: ['Logout'],
            onSelect: handleLogout
        }
    ])

    return baseItems
})
</script>

<template>
    <UDropdownMenu v-if="isLoggedIn" :items="items" :ui="{ content: 'w-48' }">
        <UAvatar :src="userInfo?.avatar || '/favicon.ico'" :alt="userInfo?.name || 'User'"
            :class="{ 'opacity-50': userInfoLoading }" @click="handleAvatarClick" />
        <template v-if="userInfoLoading" #trigger>
            <UAvatar :src="userInfo?.avatar || '/favicon.ico'" :alt="userInfo?.name || 'User'" class="opacity-50">
                <template #badge>
                    <div class="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                </template>
            </UAvatar>
        </template>
    </UDropdownMenu>

    <NuxtLink v-else to="/login">
        <UButton label="登录" color="primary" variant="outline" size="sm" />
    </NuxtLink>
</template>