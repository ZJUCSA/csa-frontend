<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const axios = inject('axios')

const data = ref([])

const page = ref(1)
const total = ref(0)
const size = ref(10)
const category = ref(1)

const table = [
    {
        name: 'events',
        title: '培训活动',
        english: 'Events',
        category: 1,
    },
    {
        name: 'research',
        title: '科研活动',
        english: 'Research',
        category: 2,
    },
]

const fetchContent = () => {
    axios
        .get('/event/list', {
            params: {
                page: page.value,
                size: size.value,
                category: category.value,
            },
        })
        .then(res => {
            data.value = res.data
        })
}

const fetchCount = () => {
    axios
        .get('/event/count')
        .then(res => {
            total.value = res.data.count
        })
        .then(() => {
            fetchContent()
        })
}

const handleClick = item => {
    router.push({
        name: 'event',
        params: {
            id: item.eid,
        },
    })
}

fetchCount()

watch([page, size, category], () => {
    fetchContent()
})
</script>

<template>
    <div
        class="mx-auto py-12 px-12 xl:px-0 flex flex-col md:flex-row gap-x-12 xl:gap-x-20 justify-center"
    >
        <div
            class="sidebar w-full mb-20 md:w-64 md:h-[22rem] bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg rounded-xl p-4 md:p-8 shrink-0"
        >
            <div class="text-2xl font-bold mb-8 mt-8 text-center">内容分类</div>
            <div
                class="flex flex-row flex-wrap md:flex-col gap-y-2 md:gap-y-4 gap-x-2 justify-center"
            >
                <button
                    class="tab-button"
                    @click="category = item.category"
                    v-for="item in table"
                    :key="item.name"
                >
                    {{ item.title }}
                </button>
            </div>
        </div>
        <div class="main-menu">
            <div class="text-3xl font-bold mb-0.5">
                {{ table[category - 1].title }}
            </div>
            <div class="text-2xl mb-8">{{ table[category - 1].english }}</div>
            <div class="mb-10">
                <div class="flex flex-col gap-y-8">
                    <div v-for="(item, index) in data" :key="index">
                        <div
                            class="py-6 px-8 rounded-xl border border-neutral-200 dark:border-0 dark:bg-neutral-100/5 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                            @click="() => handleClick(item)"
                        >
                            <div
                                class="flex flex-col lg:flex-row items-center gap-x-8"
                            >
                                <div
                                    class="w-full md:w-64 shrink-0"
                                    v-if="item.image"
                                >
                                    <img
                                        :src="item.image"
                                        alt="cover"
                                        class="w-full h-48 object-cover rounded-xl"
                                    />
                                </div>
                                <div
                                    class="p-4 w-full flex grow justify-between items-start my-1"
                                >
                                    <div>
                                        <div class="text-xl font-bold mb-1">
                                            {{ item.title }}
                                        </div>
                                        <div class="flex gap-1" v-if="item.tag">
                                            <div
                                                v-for="tag in item.tag.split(
                                                    ' '
                                                )"
                                                :key="tag"
                                            >
                                                <Tag
                                                    :value="tag"
                                                    class="text-nowrap"
                                                ></Tag>
                                            </div>
                                        </div>
                                        <div class="text-neutral-600 mt-3">
                                            {{ item.summary }}
                                        </div>
                                    </div>
                                    <div
                                        class="text-right font-bold text-neutral-400"
                                    >
                                        <div class="text-2xl">
                                            {{
                                                new Date(
                                                    item.first_publish * 1000
                                                ).toLocaleDateString()
                                            }}
                                        </div>
                                        <div class="text-xl">
                                            {{ item.place }}
                                        </div>
                                    </div>
                                </div>
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
    </div>
</template>

<style>
.p-datatable-column-title {
    white-space: nowrap;
}
</style>
