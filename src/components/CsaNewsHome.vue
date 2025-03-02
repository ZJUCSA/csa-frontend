<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

const axios = inject('axios')
const router = useRouter()

const data = ref([])
const activeTab = ref('associationNews')
const sidebarVisible = ref(true)

const showTimeSearchAssociation = ref(false)
const showTimeSearchLatest = ref(false)
const showTimeSearchCyber = ref(false)

const fetchData = (category) => {
    axios
        .get('/news/list', {
            params: { page: 1, size: 8, category },
        })
        .then(res => {
            data.value = res.data
        })
}

fetchData(1)

const changeTab = (category) => {
    activeTab.value = category
    fetchData(category === 'associationNews' ? 1 : category === 'latestAnnouncement' ? 2 : 3)
}

const toggleTimeSearch = (type) => {
    if (type === 'associationNews') {
        showTimeSearchAssociation.value = !showTimeSearchAssociation.value
        showTimeSearchLatest.value = false
        showTimeSearchCyber.value = false
    } else if (type === 'latestAnnouncement') {
        showTimeSearchLatest.value = !showTimeSearchLatest.value
        showTimeSearchAssociation.value = false
        showTimeSearchCyber.value = false
    } else if (type === 'cybersecurityKnowledge') {
        showTimeSearchCyber.value = !showTimeSearchCyber.value
        showTimeSearchAssociation.value = false
        showTimeSearchLatest.value = false
    }
}
</script>

<template>
    <div class="flex h-screen">
        <div class="sidebar w-1/6 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-lg h-screen p-6">
            <div class="text-2xl font-bold mb-6 text-center">内容分类</div>
            <div class="flex flex-col space-y-4">
                <button class="tab-button" @click="toggleTimeSearch('associationNews')">协会新闻</button>
                <transition name="fade">
                    <div v-if="showTimeSearchAssociation" class="sub-section">
                        <div class="bullet-item" v-for="item in ['今天', '过去一周', '过去一个月']" :key="item">
                            <span class="bullet-ring"></span>
                            <button class="time-button">{{ item }}</button>
                        </div>
                    </div>
                </transition>
                <button class="tab-button" @click="toggleTimeSearch('latestAnnouncement')">最新公告</button>
                <transition name="fade">
                    <div v-if="showTimeSearchLatest" class="sub-section">
                        <div class="bullet-item" v-for="item in ['今天', '过去一周', '过去一个月']" :key="item">
                            <span class="bullet-ring"></span>
                            <button class="time-button">{{ item }}</button>
                        </div>
                    </div>
                </transition>
                <button class="tab-button" @click="toggleTimeSearch('cybersecurityKnowledge')">网安知识</button>
                <transition name="fade">
                    <div v-if="showTimeSearchCyber" class="sub-section">
                        <div class="bullet-item" v-for="item in ['今天', '过去一周', '过去一个月']" :key="item">
                            <span class="bullet-ring"></span>
                            <button class="time-button">{{ item }}</button>
                        </div>
                    </div>
                </transition>
            </div>
        </div>

        <div class="news m-4 w-full" :class="{ 'ml-1/6': sidebarVisible }">
            <div class="text-2xl font-bold">最新动态</div>
            <div class="mb-6">Latest news</div>
            <transition name="fade">
                <div v-if="data.length">
                    <div v-for="item in data" :key="item.nid">
                        <div class="flex justify-between gap-x-8">
                            <router-link
                                class="news-link"
                                :to="{ name: 'news', params: { id: item.nid } }"
                            >
                                {{ item.title }}
                            </router-link>
                            <div class="shrink-0 whitespace-nowrap">
                                {{
                                    new Date(item.first_publish * 1000).toLocaleDateString('zh-CN', {
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
            </transition>
        </div>
    </div>
</template>

<style>
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
    transition: background 0.3s ease, transform 0.1s ease;
    cursor: pointer;
}

.tab-button:hover {
    background-color: #4b5563;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.tab-button:active {
    transform: scale(0.95);
}

.sub-section {
    margin-left: 1rem;
}

.bullet-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.bullet-ring {
    position: relative;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid white;
    margin-right: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bullet-ring::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: black;
}

.time-button {
    padding: 0.5rem;
    background-color: #374151;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 1rem;
    transition: background 0.3s ease, transform 0.1s ease;
    cursor: pointer;
}

.time-button:hover {
    background-color: #4b5563;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.time-button:active {
    transform: scale(0.95);
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter, .fade-leave-to {
    opacity: 0;
}

.news-link {
    transition: color 0.3s ease;
}

.news-link:hover {
    color: #f6e05e;
}
</style>
