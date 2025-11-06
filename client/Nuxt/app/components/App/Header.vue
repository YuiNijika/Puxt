<script setup>
const route = useRoute()

const items = ref([
    {
        label: '首页',
        to: '/',
    },
    {
        label: '壁纸',
        to: '/wallpaper'
    },
    {
        label: '留言',
        to: '/message'
    }
])
</script>

<template>
    <UHeader mode="slideover" :toggle="{
        color: 'primary',
        variant: 'subtle',
        class: 'rounded-full'
    }">
        <template #title>
            <NuxtLink to="/" class="flex items-center gap-3 min-w-[120px]">
                <span>Puxt</span>
            </NuxtLink>
        </template>

        <UNavigationMenu color="neutral" variant="link" :items="items" class="w-full" />

        <template #right>
            <UColorModeButton size="lg" />
            <AppUserMenu />
        </template>

        <template #body>
            <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
        </template>
    </UHeader>
</template>