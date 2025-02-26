<template>
    <div class="flex items-center justify-center p-4 mt-12">
        <div
            class="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 max-w-md w-full"
        >
            <h1
                class="text-3xl md:text-4xl font-extrabold text-white mb-4 animate-pulse"
            >
                加入我们
            </h1>
            <p class="text-xl text-white mb-6 leading-relaxed">
                成为改变世界的一份力量。我们正在寻找充满激情、富有创造力的人才。
            </p>
            <p class="text-lg text-white mb-8">一起创造未来,实现梦想!</p>
            <button
                @click="handleJoinUs"
                class="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3 px-6 rounded-full transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-yellow-200 shadow-lg"
            >
                立即加入
            </button>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleJoinUs = () => {
    router.push({ name: 'register' })
}
</script>

<style scoped>
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}
</style>
