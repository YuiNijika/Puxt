<script setup>
useSeoMeta({
    title: '仪表盘',
})

// 在 admin.vue 中统一处理权限检查
onMounted(async () => {
    if (!import.meta.client) return

    const { checkAdminPermission } = useAdminAuth()
    await checkAdminPermission(false) // 强制检查以确保权限是最新的
})
</script>

<template>
    <NuxtPage />
</template>

<style scoped>

</style>