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
        name: 'associationNews',
        title: '协会新闻',
        english: 'Association News',
        category: 1,
        icon: 'pi pi-home'
    },
    {
        name: 'latestAnnouncement',
        title: '最新公告',
        english: 'Latest Announcement',
        category: 2,
        icon: 'pi pi-bell'
    },
    {
        name: 'cybersecurityKnowledge',
        title: '网安知识',
        english: 'Cybersecurity Knowledge',
        category: 3,
        icon: 'pi pi-book'
    },
    {
        name: 'teamInfomation',
        title: '战队信息',
        english: 'Team Information',
        category: 4,
        icon: 'pi pi-users'
    },
    {
        name: 'matchInfomation',
        title: '赛事信息',
        english: 'Match Information',
        category: 5,
        icon: 'pi pi-trophy'
    },
]

const fetchContent = async () => {
    loading.value = true
    try {
        const response = await axios.get('/news/list', {
            params: {
                page: page.value,
                size: size.value,
                category: category.value,
            },
        })
        data.value = response.data
    } catch (error) {
        console.error('获取新闻列表失败:', error)
    } finally {
        loading.value = false
    }
}

const fetchCount = async () => {
    try {
        const response = await axios.get('/news/count', {
            params: {
                category: category.value,
            },
        })
        total.value = response.data.count
        await fetchContent()
    } catch (error) {
        console.error('获取新闻数量失败:', error)
    }
}

const handleClick = item => {
    router.push({
        name: 'news',
        params: {
            id: item.nid,
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
    <div class="news-container">
        <!-- 页面标题（渐变文字） -->
        <div class="page-header">
            <h1 class="page-title gradient-text">新闻资讯</h1>
            <p class="page-subtitle">Stay Updated with Latest News</p>
        </div>

        <div class="content-wrapper">
            <!-- 侧边栏 -->
            <div class="sidebar">
                <div class="sidebar-header">
                    <h3 class="sidebar-title gradient-text">内容分类</h3>
                    <p class="sidebar-subtitle">Content Categories</p>
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
                        <!-- 分类标题渐变文字 -->
                        <h2 class="content-title gradient-text">{{ table[category - 1].title }}</h2>
                        <p class="content-subtitle">{{ table[category - 1].english }}</p>
                    </div>
                    <div class="header-stats">
                        <span class="stats-text">共 {{ total }} 条内容</span>
                    </div>
                </div>

                <!-- 新闻列表 -->
                <div class="news-list">
                    <div v-if="loading" class="loading-state">
                        <div v-for="i in 6" :key="i" class="news-skeleton">
                            <div class="skeleton-image"></div>
                            <div class="skeleton-content">
                                <div class="skeleton-title"></div>
                                <div class="skeleton-date"></div>
                                <div class="skeleton-tags">
                                    <div class="skeleton-tag"></div>
                                    <div class="skeleton-tag"></div>
                                </div>
                                <div class="skeleton-summary"></div>
                            </div>
                        </div>
                    </div>

                    <div v-else-if="data.length === 0" class="empty-state">
                        <CsaEmpty />
                    </div>

                    <div v-else class="news-grid">
                        <div 
                            v-for="(item, index) in data" 
                            :key="index"
                            class="news-card"
                            :style="{ animationDelay: `${index * 0.1}s` }"
                            @click="() => handleClick(item)"
                        >
                            <div class="news-image" v-if="item.image || item.cover_image || item.thumbnail">
                                <img :src="item.image || item.cover_image || item.thumbnail" :alt="item.title" />
                                <!-- 图片覆盖层渐变背景 -->
                                <div class="news-overlay gradient-primary">
                                    <i class="pi pi-arrow-right"></i>
                                </div>
                            </div>
                            
                            <div class="news-content">
                                <div class="news-header">
                                    <h3 class="news-title">{{ item.title }}</h3>
                                    <div class="news-date">
                                        <i class="pi pi-calendar"></i>
                                        {{ new Date(item.first_publish * 1000).toLocaleDateString('zh-CN') }}
                                    </div>
                                </div>

                                <div class="news-tags" v-if="item.tag">
                                    <span 
                                        v-for="tag in item.tag.split(' ')" 
                                        :key="tag"
                                        class="news-tag"
                                    >
                                        {{ tag }}
                                    </span>
                                </div>

                                <p class="news-summary" v-if="item.summary">
                                    {{ item.summary }}
                                </p>

                                <div class="news-footer">
                                    <!-- 阅读全文渐变文字 -->
                                    <span class="view-more gradient-text">
                                        阅读全文
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
                        class="pagination-wrapeer"
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
:root {
    --color-accent: #667eea;
    --color-accent-hover: #5a6fd8;
    --bg-main: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-card: #ffffff;
    --text-main: #333333;
    --text-secondary: #666666;
    --border-color: #e1e5e9;
    --shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    --skeleton-bg: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    --gradient-text: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
    --gradient-primary: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
}

:global(.dark) .news-container {
    --color-accent: #60a5fa;
    --color-accent-hover: #7cb9ff;
    --bg-main: #0f172a;
    --bg-secondary: #172335;
    --bg-card: #233147;
    --text-main: #f8fafc;
    --text-secondary: #9eb0c7;
    --border-color: rgba(148, 163, 184, 0.18);
    --shadow: 0 24px 48px rgba(2, 6, 23, 0.24);
    --skeleton-bg: linear-gradient(90deg, #233147 25%, #2d3e57 50%, #233147 75%);
    --gradient-text: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
    --gradient-primary: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
}

.news-container {
    min-height: 100%;
    box-sizing: border-box;
    background: linear-gradient(180deg, rgba(102, 126, 234, 0.05) 0%, var(--bg-secondary) 100%);
    padding: 0 0 var(--page-footer-gap);
    transition: all 0.3s ease;
}

:global(.dark) .news-container {
    background:
        radial-gradient(circle at top center, rgba(96, 165, 250, 0.12) 0%, rgba(96, 165, 250, 0) 30%),
        linear-gradient(180deg, #0f172a 0%, #172335 22%, #1b2738 100%);
}

.page-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 40px 20px;
    background: linear-gradient(135deg, var(--bg-main) 0%, var(--bg-secondary) 100%);
    border-bottom: 1px solid var(--border-color);
    transition: all 0.3s ease;
}

:global(.dark) .page-header {
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(23, 35, 53, 0.9) 100%);
}

.page-title {
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 10px 0;
    color: var(--text-main);
}

.page-subtitle {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin: 0;
}

.content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 0;
    background: linear-gradient(90deg, var(--bg-secondary) 0%, var(--bg-card) 100%);
    min-height: calc(100vh - 200px);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow);
    transition: all 0.3s ease;
}

:global(.dark) .content-wrapper {
    background: rgba(23, 35, 53, 0.94);
    border: 1px solid rgba(148, 163, 184, 0.14);
    box-shadow: 0 26px 54px rgba(2, 6, 23, 0.26);
    backdrop-filter: blur(18px);
}

.sidebar {
    background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-card) 100%);
    border-right: 1px solid var(--border-color);
    padding: 30px 25px;
    height: 100%;
    transition: all 0.3s ease;
}

:global(.dark) .sidebar {
    background: linear-gradient(180deg, rgba(31, 44, 63, 0.92) 0%, rgba(23, 35, 53, 0.88) 100%);
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
    color: var(--text-main);
    margin: 0 0 5px 0;
}

.sidebar-subtitle {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
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
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%);
    border: 2px solid transparent;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    width: 100%;
    color: var(--text-main);
}

.category-button:hover {
    background: linear-gradient(135deg, var(--bg-card) 0%, #282828 100%);
    border-color: var(--color-accent);
    transform: translateX(5px);
    box-shadow: 0 5px 15px rgba(66, 165, 245, 0.2);
}

:global(.dark) .category-button:hover {
    background: linear-gradient(135deg, rgba(35, 49, 71, 0.96) 0%, rgba(44, 62, 86, 0.92) 100%);
    box-shadow: 0 12px 26px rgba(2, 6, 23, 0.22);
}

.category-button.active {
    background: var(--gradient-primary);
    color: white;
    border-color: var(--color-accent);
}

.category-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, rgba(66, 165, 245, 0.1) 0%, rgba(66, 165, 245, 0.05) 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-accent);
    font-size: 1.2rem;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.category-button.active .category-icon {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
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

.category-button.active .category-english {
    opacity: 0.88;
}

.main-content {
    background: var(--bg-card);
    padding: 30px;
    overflow-y: auto;
    transition: all 0.3s ease;
}

:global(.dark) .main-content {
    background: rgba(31, 44, 63, 0.82);
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
    color: var(--text-main);
    margin: 0 0 5px 0;
}

.content-subtitle {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0;
}

.stats-text {
    font-size: 0.9rem;
    color: var(--color-accent);
    font-weight: 600;
    padding: 8px 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
    border-radius: 20px;
    transition: all 0.3s ease;
}

:global(.dark) .stats-text {
    background: rgba(96, 165, 250, 0.12);
    color: #bfdbfe;
}

.news-list {
    margin-bottom: 30px;
}

.loading-state {
    display: grid;
    gap: 20px;
}

.news-skeleton {
    display: flex;
    gap: 20px;
    padding: 20px;
    background: var(--bg-card);
    border-radius: 12px;
    animation: pulse 1.5s infinite;
}

.skeleton-image,
.skeleton-title,
.skeleton-date,
.skeleton-tag,
.skeleton-summary {
    background: var(--skeleton-bg);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

.skeleton-image {
    width: 200px;
    height: 120px;
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
}

.skeleton-date {
    height: 14px;
    width: 40%;
}

.skeleton-tags {
    display: flex;
    gap: 8px;
}

.skeleton-tag {
    height: 16px;
    width: 60px;
    border-radius: 4px;
}

.skeleton-summary {
    height: 16px;
    width: 100%;
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

.news-grid {
    display: grid;
    gap: 20px;
}

.news-card {
    display: flex;
    gap: 20px;
    padding: 25px 0;
    cursor: pointer;
    transition: all 0.3s ease;
    border-bottom: 1px solid var(--border-color);
    animation: slideInUp 0.6s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
    border-image: linear-gradient(90deg, transparent 0%, var(--color-accent) 50%, transparent 100%) 1;
    background: var(--bg-card);
}

@keyframes slideInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.news-card:hover {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%);
    transform: translateX(5px);
}

:global(.dark) .news-card:hover {
    background: linear-gradient(90deg, rgba(96, 165, 250, 0.08) 0%, rgba(96, 165, 250, 0.02) 100%);
}

.news-image {
    position: relative;
    width: 200px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 0 0 1px rgba(66, 165, 245, 0.1);
}

.news-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.news-card:hover .news-image img {
    transform: scale(1.05);
}

.news-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.news-card:hover .news-overlay {
    opacity: 1;
}

.news-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.news-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 15px;
}

.news-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-main);
    margin: 0;
    line-height: 1.3;
}

.news-date {
    font-size: 0.85rem;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    flex-shrink: 0;
}

.news-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.news-tag {
    padding: 4px 12px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
    color: var(--color-accent);
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    transition: all 0.3s ease;
}

:global(.dark) .news-tag {
    background: rgba(96, 165, 250, 0.12);
    border: 1px solid rgba(96, 165, 250, 0.14);
    color: #bfdbfe;
}

.news-summary {
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.news-footer {
    margin-top: auto;
}

.view-more {
    font-weight: 600;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: gap 0.3s ease;
}

.news-card:hover .view-more {
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

/* 通用渐变类 */
.gradient-text {
    background: var(--gradient-text);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.gradient-primary {
    background: var(--gradient-primary);
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .content-wrapper {
        grid-template-columns: 1fr;
        gap: 0;
    }
    
    .sidebar {
        order: 2;
        border-right: none;
        border-bottom: 1px solid var(--border-color);
    }
    
    .main-content {
        order: 1;
    }
}

@media (max-width: 768px) {
    .news-container {
        padding: 0;
    }
    
    .page-header {
        padding: 30px 20px;
    }
    
    .page-title {
        font-size: 2rem;
    }
    
    .content-wrapper {
        max-width: 100%;
        padding: 0 20px;
        border-radius: 0;
    }
    
    .sidebar {
        padding: 20px;
    }
    
    .main-content {
        padding: 20px;
    }
    
    .news-card {
        flex-direction: column;
        gap: 15px;
    }
    
    .news-image {
        width: 100%;
        height: 200px;
    }
    
    .news-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    
    .news-date {
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
