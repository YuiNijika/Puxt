<script setup>
const MenuItems = ref([
    [
        {
            label: '首页',
            icon: 'i-lucide-home',
            to: '/'
        },
    ],
    [
        {
            label: 'GitHub',
            icon: 'i-simple-icons-github',
            to: 'https://github.com/YuiNijika/Puxt',
            target: '_blank'
        }
    ]
])
</script>

<template>
    <UNavigationMenu arrow content-orientation="vertical" :items="MenuItems" class="w-full justify-center" />
</template>
