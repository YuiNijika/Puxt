<script setup>
const title = 'Puxt'
const description = 'PHP+Nuxt=Puxt'
const headline ='重构发布'

const links = ref([
    {
        label: '加入小窝',
        to: '/member',
        icon: 'line-md:account-add'
    },
    {
        label: '轻音壁纸',
        to: '/wallpaper',
        color: 'neutral',
        variant: 'subtle',
        trailingIcon: 'line-md:image'
    }
])
</script>

<template>
    <UPageHero
        :headline="headline"
        :title="title"
        :description="description"
        :links="links"
        class="dark:bg-gray-800/50 light:bg-[url('~/assets/lg-bg.png')] light:bg-center"
    />
</template>