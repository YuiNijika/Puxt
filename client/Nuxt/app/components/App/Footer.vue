<script setup lang="ts">

</script>

<template>
    <UFooter class="bg-default/75 backdrop-blur border-t border-default">
        <template #left>
            <p class="text-muted text-sm">
                <a href="https://beian.miit.gov.cn/" target="_blank">ICP备114514号</a>
            </p>
        </template>

            <p class="text-muted text-sm">© {{ new Date().getFullYear() }} Puxt. All rights reserved.</p>
        
        <template #right>
            <UButton icon="i-simple-icons-github" color="neutral" variant="ghost" to="https://github.com/YuiNijika"
                target="_blank" aria-label="GitHub" />
        </template>
    </UFooter>
</template>
