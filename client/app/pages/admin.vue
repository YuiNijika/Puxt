<script setup>
useSeoMeta({
    title: '仪表盘',
})

const items = ref([
    [
        {
            label: '统计',
            icon: 'bi:bar-chart',
            to: '/admin/home',
        },
    ],
])

// 在 admin.vue 中统一处理权限检查
onMounted(async () => {
    if (!import.meta.client) return

    const { checkAdminPermission } = useAdminAuth()
    await checkAdminPermission(false) // 强制检查以确保权限是最新的
})
</script>

<template>
    <div class="px-6 w-full max-w-(--ui-container) mx-auto">
        <div class="navigation-container overflow-x-auto -mx-6 px-6">
            <UNavigationMenu 
                color="neutral" 
                :items="items" 
                class="w-max min-w-full py-4"
            />
        </div>
        <NuxtPage />
    </div>
</template>

<style scoped>
.navigation-container {
    /* 隐藏滚动条但保持功能 */
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.navigation-container::-webkit-scrollbar {
    display: none;
}

/* 添加一个微妙的阴影指示滚动 */
.navigation-container::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 30px;
    background: linear-gradient(to left, rgba(255, 255, 255, 0.8), transparent);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
}

.navigation-container.has-scroll::after {
    opacity: 1;
}
</style>