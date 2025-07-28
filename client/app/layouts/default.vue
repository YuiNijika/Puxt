<script setup>

</script>

<template>
    <div class="bg-gray-900 text-white flex flex-col">
        <AppHeader />
        <main class="min-h-screen">
            <slot />
        </main>
        <AppFooter />
    </div>
</template>