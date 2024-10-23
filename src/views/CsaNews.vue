<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const axios = inject('axios')

const data = ref([])

const page = ref(1)
const total = ref(0)
const size = ref(10)

const fetchContent = () => {
    axios
        .get('/news/list', {
            params: {
                page: page.value,
                size: size.value,
            },
        })
        .then(res => {
            data.value = res.data
        })
}

axios
    .get('/news/count')
    .then(res => {
        total.value = res.data.count
    })
    .then(() => {
        fetchContent()
    })

const handleClick = item => {
    router.push({
        name: 'news',
        params: {
            id: item.nid,
        },
    })
}

watch([page, size], () => {
    fetchContent()
})
</script>

<template>
    <div class="main-part mx-auto py-12">
        <div class="text-3xl font-bold mb-0.5">最新动态</div>
        <div class="text-2xl mb-8">Latest News</div>
        <div class="mb-10">
            <div class="flex flex-col gap-y-8">
                <div v-for="(item, index) in data" :key="index">
                    <div
                        class="py-6 px-8 rounded-xl border border-neutral-200 dark:border-0 dark:bg-neutral-100/5 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                        @click="() => handleClick(item)"
                    >
                        <div class="flex justify-between items-center mb-1">
                            <div class="text-xl font-bold">
                                {{ item.title }}
                            </div>
                            <div class="text-sm text-neutral-500">
                                {{
                                    new Date(
                                        item.first_publish * 1000
                                    ).toLocaleDateString()
                                }}
                            </div>
                        </div>
                        <div class="mb-2">
                            <div class="flex gap-1">
                                <div
                                    v-for="tag in item.tag.split(' ')"
                                    :key="tag"
                                >
                                    <Tag :value="tag" class="text-nowrap"></Tag>
                                </div>
                            </div>
                        </div>
                        <div class="text-neutral-600">
                            {{ item.summary }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex justify-end">
            <Paginator
                v-model:page="page"
                v-model:rows="size"
                :totalRecords="total"
                :rowsPerPageOptions="[10, 20, 30]"
            ></Paginator>
        </div>
    </div>
</template>

<style>
.p-datatable-column-title {
    white-space: nowrap;
}
</style>
