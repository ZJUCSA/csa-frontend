<script setup>
import CsaEmpty from '@/components/CsaEmpty.vue'
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
        name: 'associationNews',
        title: '协会新闻',
        english: 'Association News',
        category: 1,
    },
    {
        name: 'latestAnnouncement',
        title: '最新公告',
        english: 'Latest Announcement',
        category: 2,
    },
    {
        name: 'cybersecurityKnowledge',
        title: '网安知识',
        english: 'Cybersecurity Knowledge',
        category: 3,
    },
    {
        name: 'teamInfomation',
        title: '战队信息',
        english: 'Team Information',
        category: 4,
    },
    {
        name: 'matchInfomation',
        title: '赛事信息',
        english: 'Match Information',
        category: 5,
    },
]

const fetchContent = () => {
    axios
        .get('/news/list', {
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
        .get('/news/count', {
            params: {
                category: category.value,
            },
        })
        .then(res => {
            total.value = res.data.count
        })
        .then(() => {
            fetchContent()
        })
}

const handleClick = item => {
    router.push({
        name: 'news',
        params: {
            id: item.nid,
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
            class="sidebar w-full mb-20 md:w-64 md:h-[38rem] bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg rounded-xl p-4 md:p-8 shrink-0"
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
                <CsaEmpty v-if="data.length === 0"></CsaEmpty>
                <div class="flex flex-col gap-y-8">
                    <div v-for="(item, index) in data" :key="index">
                        <div
                            class="py-6 px-8 rounded-xl border border-neutral-200 dark:border-0 dark:bg-neutral-100/5 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                            @click="() => handleClick(item)"
                        >
                            <div
                                class="flex flex-col lg:flex-row gap-x-4 items-center"
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
                                <div class="p-4 self-start mt-4 md:mt-0">
                                    <div class="mb-4">
                                        <div class="text-xl font-bold mb-1">
                                            {{ item.title }}
                                        </div>
                                        <div
                                            class="text-sm text-neutral-500 self-start"
                                        >
                                            {{
                                                new Date(
                                                    item.first_publish * 1000
                                                ).toLocaleDateString()
                                            }}
                                        </div>
                                    </div>
                                    <div class="mb-2">
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
                                    </div>
                                    <div class="text-neutral-600">
                                        {{ item.summary }}
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

.sidebar {
    backdrop-filter: blur(10px);
}

.tab-button {
    padding: 1rem;
    margin-bottom: 0.5rem;
    background-color: #1f2937;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 1.125rem;
    transition:
        background 0.3s ease,
        transform 0.1s ease;
    cursor: pointer;
}

.tab-button:hover {
    background-color: #4b5563;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.tab-button:active {
    transform: scale(0.95);
}
</style>
