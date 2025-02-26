<script setup>
const axios = inject('axios')

const data1 = ref([])
const data2 = ref([])
const data3 = ref([])

axios
    .get('/news/list', {
        params: { page: 1, size: 8, category: 2 },
    })
    .then(res => {
        data1.value = res.data
    })

axios
    .get('/news/list', {
        params: { page: 1, size: 8, category: 3 },
    })
    .then(res => {
        data2.value = res.data
    })

axios
    .get('/news/list', {
        params: { page: 1, size: 8, category: 5 },
    })
    .then(res => {
        data3.value = res.data
    })
</script>

<template>
    <!-- 通知公告 -->
    <div class="flex-1 m-8">
        <div class="text-2xl font-bold">通知公告</div>
        <div class="mb-6">Announcement & Notice</div>

        <div v-if="data1">
            <div v-for="item in data1" :key="item.nid">
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
            <div v-for="i in 3" :key="i">
                <Skeleton height="2rem" class="mb-4"></Skeleton>
            </div>
        </div>
    </div>

    <!-- 网安知识 -->
    <div class="flex-1 m-8">
        <div class="text-2xl font-bold">网安知识</div>
        <div class="mb-6">Cyber Security Knowledge</div>

        <div v-if="data2">
            <div v-for="item in data2" :key="item.nid">
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
            <div v-for="i in 3" :key="i">
                <Skeleton height="2rem" class="mb-4"></Skeleton>
            </div>
        </div>
    </div>

    <!-- 赛事信息 -->
    <div class="flex-1 m-8">
        <div class="text-2xl font-bold">赛事信息</div>
        <div class="mb-6">Contest</div>

        <div v-if="data3">
            <div v-for="item in data3" :key="item.nid">
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
            <div v-for="i in 3" :key="i">
                <Skeleton height="2rem" class="mb-4"></Skeleton>
            </div>
        </div>
    </div>
</template>
