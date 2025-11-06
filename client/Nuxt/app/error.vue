<script setup lang="ts">
import type { NuxtError } from '#app'

useSeoMeta({
    titleTemplate: '错误'
})

const props = defineProps<{
    error: NuxtError
}>()
</script>

<template>
    <UApp>
        <UHeader />

        <UError :error="error" />

        <UFooter />
    </UApp>
</template>
