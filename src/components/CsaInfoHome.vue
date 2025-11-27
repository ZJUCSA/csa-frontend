<script setup>
import { ref, inject, onMounted } from 'vue'

const axios = inject('axios')

const data1 = ref([])
const data2 = ref([])
const data3 = ref([])
const loading = ref(true)

const fetchData = async () => {
    try {
        const [res1, res2, res3] = await Promise.all([
            axios.get('/news/list', { params: { page: 1, size: 6, category: 2 } }),
            axios.get('/news/list', { params: { page: 1, size: 6, category: 3 } }),
            axios.get('/news/list', { params: { page: 1, size: 6, category: 5 } })
        ])
        
        data1.value = res1.data
        data2.value = res2.data || []
        data3.value = res3.data
    } catch (error) {
        console.error('获取信息失败:', error)
        try {
            const fallbackRes = await axios.get('/news/list', { params: { page: 1, size: 6, category: 3 } })
            data2.value = fallbackRes.data
        } catch (fallbackError) {
            console.error('获取网安知识失败:', fallbackError)
            data2.value = []
        }
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchData()
})
</script>

<template>
    <div class="info-layout">
        <div class="info-section">
            <div class="section-header">
                <h3 class="section-title">通知公告</h3>
                <p class="section-subtitle">Announcement & Notice</p>
            </div>
            <div class="info-list">
                <div v-if="!loading && data1.length > 0">
                    <div 
                        v-for="(item, index) in data1" 
                        :key="item.nid"
                        class="list-item"
                        :style="{ animationDelay: `${index * 0.1}s` }"
                    >
                        <router-link
                            class="item-link"
                            :to="{ name: 'news', params: { id: item.nid } }"
                        >
                            <span class="item-title">{{ item.title }}</span>
                            <span class="item-date">
                                {{ new Date(item.first_publish * 1000).toLocaleDateString('zh-CN', {
                                    month: '2-digit',
                                    day: '2-digit',
                                }) }}
                            </span>
                        </router-link>
                    </div>
                </div>
                <div v-else-if="loading" class="loading-state">
                    <div v-for="i in 4" :key="i" class="skeleton-item">
                        <div class="skeleton-title"></div>
                        <div class="skeleton-date"></div>
                    </div>
                </div>
                <div v-else class="empty-state">
                    <p class="empty-text">暂无通知公告</p>
                </div>
            </div>
        </div>

        <div class="info-section">
            <div class="section-header">
                <h3 class="section-title">网安知识</h3>
                <p class="section-subtitle">Cyber Security Knowledge</p>
            </div>
            <div class="info-list">
                <div v-if="!loading && data2.length > 0">
                    <div 
                        v-for="(item, index) in data2" 
                        :key="item.kid || item.nid"
                        class="list-item"
                        :style="{ animationDelay: `${index * 0.1}s` }"
                    >
                        <router-link
                            class="item-link"
                            :to="{ name: item.kid ? 'admin-knowledge' : 'news', params: { id: item.kid || item.nid } }"
                        >
                            <span class="item-title">{{ item.title }}</span>
                            <span class="item-date">
                                {{ new Date((item.publish_date || item.first_publish) * 1000).toLocaleDateString('zh-CN', {
                                    month: '2-digit',
                                    day: '2-digit',
                                }) }}
                            </span>
                        </router-link>
                    </div>
                </div>
                <div v-else-if="loading" class="loading-state">
                    <div v-for="i in 4" :key="i" class="skeleton-item">
                        <div class="skeleton-title"></div>
                        <div class="skeleton-date"></div>
                    </div>
                </div>
                <div v-else class="empty-state">
                    <p class="empty-text">暂无网安知识</p>
                </div>
            </div>
        </div>

        <div class="info-section">
            <div class="section-header">
                <h3 class="section-title">赛事信息</h3>
                <p class="section-subtitle">Contest Information</p>
            </div>
            <div class="info-list">
                <div v-if="!loading && data3.length > 0">
                    <div 
                        v-for="(item, index) in data3" 
                        :key="item.nid"
                        class="list-item"
                        :style="{ animationDelay: `${index * 0.1}s` }"
                    >
                        <router-link
                            class="item-link"
                            :to="{ name: 'news', params: { id: item.nid } }"
                        >
                            <span class="item-title">{{ item.title }}</span>
                            <span class="item-date">
                                {{ new Date(item.first_publish * 1000).toLocaleDateString('zh-CN', {
                                    month: '2-digit',
                                    day: '2-digit',
                                }) }}
                            </span>
                        </router-link>
                    </div>
                </div>
                <div v-else-if="loading" class="loading-state">
                    <div v-for="i in 4" :key="i" class="skeleton-item">
                        <div class="skeleton-title"></div>
                        <div class="skeleton-date"></div>
                    </div>
                </div>
                <div v-else class="empty-state">
                    <p class="empty-text">暂无赛事信息</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.info-layout {
    display: flex;
    width: 100%;
}

.info-section {
    flex: 1 1 0%;
    padding: 20px;
    background-color: var(--bg-surface);
    position: relative;
}

.info-section:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20px;
    bottom: 20px;
    width: 1px;
    background-color: var(--border-color);
}

.section-header {
    margin-bottom: 20px;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 10px;
}

.section-title {
    font-size: 1.5rem; /* 标题字体增大 */
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 5px 0;
}

.section-subtitle {
    font-size: 0.9rem; /* 英文副标题 */
    color: var(--text-secondary);
    margin: 0;
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.list-item {
    animation: fadeInUp 0.6s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
}

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.item-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-decoration: none;
    color: var(--text-primary);
    padding: 10px 0;
    border-bottom: 1px solid var(--border-color);
    transition: all 0.2s ease;
}

.item-link:hover {
    color: var(--accent-color);
    transform: translateX(5px);
}

.item-title {
    flex: 1;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.5;
}

.item-date {
    font-size: 0.85rem;
    color: var(--text-secondary);
    white-space: nowrap;
    margin-left: 15px;
}

/* loading状态 */
.loading-state {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.skeleton-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--border-color);
}

.skeleton-title {
    height: 14px;
    width: 70%;
    background-color: var(--bg-secondary);
    border-radius: 4px;
    animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-date {
    height: 14px;
    width: 20%;
    background-color: var(--bg-secondary);
    border-radius: 4px;
    animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
}

/* empty状态 */
.empty-state {
    text-align: center;
    padding: 20px 0;
}

.empty-text {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 992px) {
    .info-layout {
        flex-direction: column;
    }
    .info-section:not(:last-child)::after {
        content: none; /* 移除垂直分隔线 */
    }
    .info-section:not(:last-child) {
        border-bottom: 1px solid var(--border-color);
    }
}
</style>