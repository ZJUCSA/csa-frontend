<script setup>
const data = ref([
    { title: '测试1', time: '2021-10-10', id: 1 },
    { title: '测试2', time: '2021-10-11', id: 2 },
    { title: '测试3', time: '2021-10-12', id: 3 },
    { title: '测试4', time: '2021-10-13', id: 4 },
    { title: '测试5', time: '2021-10-14', id: 5 },
    { title: '测试6', time: '2021-10-15', id: 6 },
    {
        title: '测试7测试7测试7测试7测试7测试7测试7测试7测试7测试7',
        time: '2021-10-16',
        id: 7,
    },
])
</script>

<template>
    <div class="news m-8">
        <div class="text-2xl font-bold">活动一览</div>
        <div class="mb-6">Events</div>
        <div v-for="item in data" :key="item.id">
            <div class="flex justify-between gap-x-8">
                <router-link
                    class="w-64 whitespace-nowrap text-ellipsis overflow-hidden link"
                    :to="{ name: 'event', params: { id: item.id } }"
                >
                    {{ item.title }}
                </router-link>
                <div class="shrink-0 whitespace-nowrap">{{ item.time }}</div>
            </div>
            <Divider />
        </div>
    </div>
</template>
