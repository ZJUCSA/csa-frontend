<script setup>
const axios = inject('axios')

const data = ref([])

axios
    .get('/news/list', {
        params: { page: 1, size: 8, category: 1 },
    })
    .then(res => {
        data.value = res.data
    })
</script>

<template>
    <div class="news m-8">
        <div class="text-2xl font-bold">最新动态</div>
        <div class="mb-6">Latest news</div>
        <div v-if="data">
            <div v-for="item in data" :key="item.nid">
                <div class="flex justify-between gap-x-8">
                    <router-link
                        class="w-[30vw] text-[1.05rem] whitespace-nowrap text-ellipsis overflow-hidden link"
                        :to="{ name: 'news', params: { id: item.nid } }"
                    >
                        {{ item.title }}
                    </router-link>
                    <div class="shrink-0 whitespace-nowrap">
                        {{
                            new Date(
                                item.first_publish * 1000
                            ).toLocaleDateString('zh-CN', {
                                month: '2-digit',
                                day: '2-digit',
                            })
                        }}
                    </div>
                </div>
                <Divider class="!my-3" />
            </div>
        </div>
        <div v-else>
            <Skeleton height="2rem" class="mb-4"></Skeleton>
            <Skeleton height="2rem" class="mb-4"></Skeleton>
            <Skeleton height="2rem" class="mb-4"></Skeleton>
            <Skeleton height="2rem" class="mb-4"></Skeleton>
            <Skeleton height="2rem" class="mb-4"></Skeleton>
        </div>
    </div>
</template>
