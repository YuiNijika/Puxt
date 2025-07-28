<script setup>
const { isMobile } = useViewport()
</script>

<template>
    <header class="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
        <UContainer>
            <div class="flex justify-between items-center h-16 md:h-20">
                <NuxtLink to="/" class="flex items-center gap-3 min-w-[120px]">
                    <span class="text-3xl font-bold text-white whitespace-nowrap">Puxt</span>
                </NuxtLink>
                <AppMenuUNavigation v-if="!isMobile" />
                <AppMenuUser />
            </div>
        </UContainer>
    </header>
</template>