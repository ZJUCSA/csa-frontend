<script setup>
</script>

<template>
    <div class="flex flex-col items-center justify-center py-24">
        <div class="text-6xl font-bold text-red-500">403</div>
        <div class="mt-4 text-lg text-neutral-600">无权限访问该页面</div>
        <RouterLink class="mt-6 text-blue-600" :to="{ name: 'home' }">返回首页</RouterLink>
    </div>
</template>

<style scoped>
</style>
