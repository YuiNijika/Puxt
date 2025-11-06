export const useViewport = () => {
    const isMobile = ref(false)

    // 定义断点
    const MOBILE_BREAKPOINT = 768

    const checkViewport = () => {
        if (import.meta.client) {
            isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
        }
    }

    onMounted(() => {
        if (import.meta.client) {
            checkViewport()
            window.addEventListener('resize', checkViewport)
        }
    })

    onUnmounted(() => {
        if (import.meta.client) {
            window.removeEventListener('resize', checkViewport)
        }
    })

    return {
        isMobile,
        width: import.meta.client ? ref(window.innerWidth) : ref(0)
    }
}