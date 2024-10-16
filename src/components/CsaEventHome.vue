<script setup>
const axios = inject('axios')

const data = ref([])

axios
    .get('/event/list', {
        params: { page: 1, size: 8 },
    })
    .then(res => {
        data.value = res.data
    })
</script>

<template>
    <div class="news m-8">
        <div class="text-2xl font-bold">活动一览</div>
        <div class="mb-6">Events</div>
        <div v-for="item in data" :key="item.eid">
            <div class="flex justify-between gap-x-8">
                <router-link
                    class="w-[15vw] whitespace-nowrap text-ellipsis overflow-hidden link"
                    :to="{ name: 'event', params: { id: item.eid } }"
                >
                    {{ item.title }}
                </router-link>
                <div class="shrink-0 whitespace-nowrap">
                    {{
                        new Date(item.start_time * 1000).toLocaleDateString(
                            'zh-CN',
                            {
                                month: '2-digit',
                                day: '2-digit',
                            }
                        )
                    }}
                </div>
            </div>
            <Divider class="!my-3" />
        </div>
    </div>
</template>
