<script setup>
import CsaEmpty from '@/components/CsaEmpty.vue'
import { useRouter } from 'vue-router'
import { ref, inject, watch, onMounted } from 'vue'

const router = useRouter()
const axios = inject('axios')

const data = ref([])
const loading = ref(true)

const page = ref(1)
const total = ref(0)
const size = ref(10)
const category = ref(1)

const table = [
    {
        name: 'events',
        title: '培训活动',
        english: 'Training Events',
        category: 1,
        icon: 'pi pi-calendar'
    },
    {
        name: 'research',
        title: '科研活动',
        english: 'Research Activities',
        category: 2,
        icon: 'pi pi-search'
    },
]

const fetchContent = async () => {
    loading.value = true
    try {
        const response = await axios.get('/event/list', {
            params: {
                page: page.value,
                size: size.value,
                category: category.value,
            },
        })
        data.value = response.data
    } catch (error) {
        console.error('获取活动列表失败:', error)
    } finally {
        loading.value = false
    }
}

const fetchCount = async () => {
    try {
        const response = await axios.get('/event/count')
        total.value = response.data.count
        await fetchContent()
    } catch (error) {
        console.error('获取活动数量失败:', error)
    }
}

const handleClick = item => {
    router.push({
        name: 'event',
        params: {
            id: item.eid,
        },
    })
}

onMounted(() => {
    fetchCount()
})

watch([page, size, category], () => {
    fetchContent()
})
</script>

<template>
    <div class="events-container">
        <!-- 页面标题 -->
        <div class="page-header">
            <h1 class="page-title">活动中心</h1>
            <p class="page-subtitle">Discover and Join Exciting Events</p>
        </div>

        <div class="content-wrapper">
            <!-- 侧边栏 -->
            <div class="sidebar">
                <div class="sidebar-header">
                    <h3 class="sidebar-title">活动分类</h3>
                    <p class="sidebar-subtitle">Event Categories</p>
                </div>
                
                <div class="category-list">
                    <button
                        class="category-button"
                        :class="{ active: category === item.category }"
                        @click="category = item.category"
                        v-for="item in table"
                        :key="item.name"
                    >
                        <div class="category-icon">
                            <i :class="item.icon"></i>
                        </div>
                        <div class="category-content">
                            <span class="category-title">{{ item.title }}</span>
                            <span class="category-english">{{ item.english }}</span>
                        </div>
                    </button>
                </div>
            </div>

            <!-- 主内容区 -->
            <div class="main-content">
                <div class="content-header">
                    <div class="header-info">
                        <h2 class="content-title">{{ table[category - 1].title }}</h2>
                        <p class="content-subtitle">{{ table[category - 1].english }}</p>
                    </div>
                    <div class="header-stats">
                        <span class="stats-text">共 {{ total }} 个活动</span>
                    </div>
                </div>

                <!-- 活动列表 -->
                <div class="events-list">
                    <div v-if="loading" class="loading-state">
                        <div v-for="i in 6" :key="i" class="event-skeleton">
                            <div class="skeleton-image"></div>
                            <div class="skeleton-content">
                                <div class="skeleton-title"></div>
                                <div class="skeleton-tags">
                                    <div class="skeleton-tag"></div>
                                    <div class="skeleton-tag"></div>
                                </div>
                                <div class="skeleton-summary"></div>
                                <div class="skeleton-meta"></div>
                            </div>
                        </div>
                    </div>

                    <div v-else-if="data.length === 0" class="empty-state">
                        <CsaEmpty />
                    </div>

                    <div v-else class="events-grid">
                        <div 
                            v-for="(item, index) in data" 
                            :key="index"
                            class="event-card"
                            :style="{ animationDelay: `${index * 0.1}s` }"
                            @click="() => handleClick(item)"
                        >
                            <div class="event-image" v-if="item.image">
                                <img :src="item.image" :alt="item.title" />
                                <div class="event-overlay">
                                    <i class="pi pi-arrow-right"></i>
                                </div>
                            </div>
                            
                            <div class="event-content">
                                <div class="event-header">
                                    <h3 class="event-title">{{ item.title }}</h3>
                                    <div class="event-meta">
                                        <span class="event-date">
                                            <i class="pi pi-calendar"></i>
                                            {{ new Date(item.first_publish * 1000).toLocaleDateString('zh-CN') }}
                                        </span>
                                        <span v-if="item.place" class="event-location">
                                            <i class="pi pi-map-marker"></i>
                                            {{ item.place }}
                                        </span>
                                    </div>
                                </div>

                                <div class="event-tags" v-if="item.tag">
                                    <span 
                                        v-for="tag in item.tag.split(' ')" 
                                        :key="tag"
                                        class="event-tag"
                                    >
                                        {{ tag }}
                                    </span>
                                </div>

                                <p class="event-summary" v-if="item.summary">
                                    {{ item.summary }}
                                </p>

                                <div class="event-footer">
                                    <span class="view-more">
                                        查看详情
                                        <i class="pi pi-arrow-right"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 分页 -->
                <div class="pagination-wrapper">
                    <Paginator
                        v-model:page="page"
                        v-model:rows="size"
                        :totalRecords="total"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.events-container {
    min-height: 100%;
    box-sizing: border-box;
    background: var(--gradient-primary);
    padding: 40px 20px calc(40px + var(--page-footer-gap));
    transition: background 0.3s ease;
}

.page-header {
    text-align: center;
    margin-bottom: 40px;
    color: white;
}

.page-title {
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 10px 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    margin: 0;
}

.content-wrapper {
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 30px;
    background: rgba(var(--bg-surface-rgb), 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 20px 40px var(--shadow-color);
    transition: background 0.3s ease, box-shadow 0.3s ease;
}

.sidebar {
    background: var(--bg-surface);
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 10px 30px var(--shadow-color);
    height: fit-content;
    transition: background 0.3s ease, box-shadow 0.3s ease;
}

.sidebar-header {
    text-align: center;
    margin-bottom: 25px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--border-color);
    transition: border-color 0.3s ease;
}

.sidebar-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 5px 0;
    transition: color 0.3s ease;
}

.sidebar-subtitle {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
    transition: color 0.3s ease;
}

.category-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.category-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    background: var(--bg-secondary);
    border: 2px solid transparent;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    width: 100%;
    color: var(--text-primary);
}

.category-button:hover {
    background: var(--bg-surface);
    border-color: var(--accent-color);
    transform: translateX(5px);
    box-shadow: 0 5px 15px var(--shadow-color);
}

.category-button.active {
    background: var(--gradient-primary);
    color: white;
    border-color: var(--accent-color);
}

.category-icon {
    width: 40px;
    height: 40px;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-color);
    font-size: 1.2rem;
    flex-shrink: 0;
    transition: background 0.3s ease, color 0.3s ease;
}

.dark .category-icon {
    background: rgba(66, 165, 245, 0.1);
}

.category-button.active .category-icon {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.category-content {
    display: flex;
    flex-direction: column;
}

.category-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 2px;
}

.category-english {
    font-size: 0.8rem;
    opacity: 0.7;
}

.main-content {
    background: var(--bg-surface);
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 10px 30px var(--shadow-color);
    transition: background 0.3s ease, box-shadow 0.3s ease;
}

.content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--border-color);
    transition: border-color 0.3s ease;
}

.content-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 5px 0;
    transition: color 0.3s ease;
}

.content-subtitle {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0;
    transition: color 0.3s ease;
}

.stats-text {
    font-size: 0.9rem;
    color: var(--accent-color);
    font-weight: 600;
    padding: 8px 16px;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 20px;
    transition: background 0.3s ease, color 0.3s ease;
}

.dark .stats-text {
    background: rgba(66, 165, 245, 0.1);
}

.events-list {
    margin-bottom: 30px;
}

.loading-state {
    display: grid;
    gap: 20px;
}

.event-skeleton {
    display: flex;
    gap: 20px;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 12px;
    animation: pulse 1.5s infinite;
    transition: background 0.3s ease;
}

.skeleton-image {
    width: 200px;
    height: 120px;
    background: var(--skeleton-gradient);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
    flex-shrink: 0;
}

.skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.skeleton-title {
    height: 20px;
    width: 80%;
    background: var(--skeleton-gradient);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

.skeleton-tags {
    display: flex;
    gap: 8px;
}

.skeleton-tag {
    height: 16px;
    width: 60px;
    background: var(--skeleton-gradient);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

.skeleton-summary {
    height: 16px;
    width: 100%;
    background: var(--skeleton-gradient);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

.skeleton-meta {
    height: 14px;
    width: 60%;
    background: var(--skeleton-gradient);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
}

.events-grid {
    display: grid;
    gap: 20px;
}

.event-card {
    display: flex;
    gap: 20px;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;
    animation: slideInUp 0.6s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
}

@keyframes slideInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.event-card:hover {
    background: var(--bg-surface);
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px var(--shadow-color);
}

.event-image {
    position: relative;
    width: 200px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.event-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.event-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(102, 126, 234, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    opacity: 0;
    transition: opacity 0.3s ease, background 0.3s ease;
}

.dark .event-overlay {
    background: rgba(66, 165, 245, 0.8);
}

.event-card:hover .event-overlay {
    opacity: 1;
}

.event-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 15px;
}

.event-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.3;
    transition: color 0.3s ease;
}

.event-meta {
    display: flex;
    flex-direction: column;
    gap: 5px;
    text-align: right;
    flex-shrink: 0;
}

.event-date,
.event-location {
    font-size: 0.85rem;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    transition: color 0.3s ease;
}

.event-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.event-tag {
    padding: 4px 12px;
    background: rgba(102, 126, 234, 0.1);
    color: var(--accent-color);
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    transition: background 0.3s ease, color 0.3s ease;
}

.dark .event-tag {
    background: rgba(66, 165, 245, 0.1);
}

.event-summary {
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.3s ease;
}

.event-footer {
    margin-top: auto;
}

.view-more {
    color: var(--accent-color);
    font-weight: 600;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: gap 0.3s ease, color 0.3s ease;
}

.event-card:hover .view-more {
    gap: 8px;
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

/* 使用:deep()穿透Paginator组件样式，应用全局CSS变量 */
.pagination-wrapper :deep(.p-paginator) {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 10px;
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.pagination-wrapper :deep(.p-paginator-page),
.pagination-wrapper :deep(.p-paginator-first),
.pagination-wrapper :deep(.p-paginator-prev),
.pagination-wrapper :deep(.p-paginator-next),
.pagination-wrapper :deep(.p-paginator-last) {
    background: var(--bg-surface);
    color: var(--text-primary);
    border-color: var(--border-color);
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.pagination-wrapper :deep(.p-paginator-page:hover),
.pagination-wrapper :deep(.p-paginator-first:hover),
.pagination-wrapper :deep(.p-paginator-prev:hover),
.pagination-wrapper :deep(.p-paginator-next:hover),
.pagination-wrapper :deep(.p-paginator-last:hover) {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.pagination-wrapper :deep(.p-paginator-page.p-highlight) {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
}

.pagination-wrapper :deep(.p-paginator-current) {
    color: var(--text-primary);
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .content-wrapper {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .sidebar {
        order: 2;
    }
    
    .main-content {
        order: 1;
    }
}

@media (max-width: 768px) {
    .events-container {
        padding: 20px 15px calc(20px + var(--page-footer-gap));
    }
    
    .page-title {
        font-size: 2rem;
    }
    
    .content-wrapper {
        padding: 20px;
    }
    
    .event-card {
        flex-direction: column;
        gap: 15px;
    }
    
    .event-image {
        width: 100%;
        height: 200px;
    }
    
    .event-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    
    .event-meta {
        text-align: left;
    }
    
    .category-list {
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: 10px;
    }
    
    .category-button {
        min-width: 150px;
        flex-shrink: 0;
    }
}
</style>
