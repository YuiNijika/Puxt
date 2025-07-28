<script setup>
const { isMobile } = useViewport()
</script>

<template>
    <footer class="bg-gray-900 text-white pb-8 pt-10">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="border-t border-gray-800 pt-8">
                <div class="flex flex-col md:flex-row justify-between items-center">
                    <p class="text-gray-500 text-sm mb-4 md:mb-0">
                        © Puxt {{ new Date().getFullYear() }} All right reserved
                    </p>
                    <div class="flex space-x-6">
                        <a href="https://github.com/YuiNijika/Puxt" target="_blank" class="text-gray-500 hover:text-white text-sm transition-colors">
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</template>