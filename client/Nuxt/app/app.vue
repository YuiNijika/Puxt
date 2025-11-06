<script setup lang="ts">
useSeoMeta({
  titleTemplate: '%s - Puxt',
})
</script>

<template>
  <UApp>
    <AppHeader />

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <AppFooter />
  </UApp>
</template>
