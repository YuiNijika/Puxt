export const useAdminAuth = () => {
    const router = useRouter()
    const authStore = import.meta.client ? useAuthStore() : null

    const checkAdminPermission = async (skipIfInitialized = true) => {
        if (!import.meta.client) return false

        try {
            // 如果已经初始化并且设置了跳过，则直接使用现有状态
            if (skipIfInitialized && authStore.initialized) {
                if (!authStore.isLoggedIn) {
                    router.push('/login')
                    return false
                } else if (authStore.user && authStore.user.group !== 'admin') {
                    router.push('/error/forbidden')
                    return false
                }
                return true
            }

            // 除非必要强制使用缓存检查
            const result = await authStore.checkAuthStatus(false)
            if (result.success && !result.logged_in) {
                router.push('/login')
                return false
            } else if (result.success && result.logged_in) {
                if (result.user && result.user.group !== 'admin') {
                    router.push('/error/forbidden')
                    return false
                }
                return true
            }
            return false
        } catch (err) {
            console.error('检查权限失败:', err)
            return false
        }
    }

    return {
        checkAdminPermission
    }
}