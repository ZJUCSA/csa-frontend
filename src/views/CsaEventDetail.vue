<script setup>
import { useRoute } from 'vue-router'
import { ref, inject, onMounted } from 'vue'
import { processMarkdownImages, processImageUrl } from '@/utils/imageUtils'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

const route = useRoute()
const eid = route.params.id

const axios = inject('axios')

const data = ref(null)
const loading = ref(true)

const fetchEventDetail = async () => {
    loading.value = true
    try {
        const response = await axios.get('/event/detail', {
            params: {
                eid: eid,
            },
        })
        // 处理图片URL
        const processedData = {
            ...response.data,
            description: processMarkdownImages(response.data.description),
            image: processImageUrl(response.data.image)
        }
        data.value = processedData
    } catch (error) {
        console.error('获取事件详情失败:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchEventDetail()
})
</script>

<template>
    <div class="event-detail-container">
        <div class="content-wrapper">
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
                <div class="skeleton-header">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-tags">
                        <div class="skeleton-tag"></div>
                        <div class="skeleton-tag"></div>
                    </div>
                </div>
                <div class="skeleton-meta">
                    <div class="skeleton-meta-item"></div>
                    <div class="skeleton-meta-item"></div>
                </div>
                <div class="skeleton-content">
                    <div class="skeleton-section"></div>
                    <div class="skeleton-section"></div>
                    <div class="skeleton-section"></div>
                </div>
            </div>

            <!-- 事件详情 -->
            <div v-else-if="data" class="event-detail">
                <!-- 头部信息 -->
                <div class="event-header">
                    <h1 class="event-title">{{ data.title }}</h1>
                    
                    <div class="event-tags" v-if="data.tag">
                        <span 
                            v-for="tag in data.tag.split(' ')" 
                            :key="tag"
                            class="event-tag"
                        >
                            {{ tag }}
                        </span>
                    </div>

                    <div class="event-meta">
                        <!-- <div class="meta-item">
                            <i class="pi pi-user"></i>
                            <span>发布者：{{ data.publisher }}</span>
                        </div> -->
                        <div class="meta-item">
                            <i class="pi pi-calendar"></i>
                            <span>发布时间：{{ new Date(data.first_publish * 1000).toLocaleDateString('zh-CN') }}</span>
                        </div>
                    </div>
                </div>

                <!-- 基本信息卡片 -->
                <div class="info-card">
                    <h2 class="card-title">
                        <i class="pi pi-info-circle"></i>
                        基本信息
                    </h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">开始时间</div>
                            <div class="info-value">
                                {{ new Date(data.start_time * 1000).toLocaleString('zh-CN') }}
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">结束时间</div>
                            <div class="info-value">
                                {{ new Date(data.end_time * 1000).toLocaleString('zh-CN') }}
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">活动地点</div>
                            <div class="info-value">
                                <i class="pi pi-map-marker"></i>
                                {{ data.place }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 活动简介 -->
                <div class="description-card">
                    <h2 class="card-title">
                        <i class="pi pi-file-text"></i>
                        活动简介
                    </h2>
                    <div class="description-content">
                        <MarkdownRenderer :content="data.description" />
                    </div>
                </div>
            </div>

            <!-- 错误状态 -->
            <div v-else class="error-state">
                <div class="error-icon">
                    <i class="pi pi-exclamation-triangle"></i>
                </div>
                <h3 class="error-title">加载失败</h3>
                <p class="error-message">无法获取事件详情，请稍后重试</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.event-detail-container {
    min-height: 100%;
    box-sizing: border-box;
    background: var(--bg-secondary);
    padding: 40px 20px calc(40px + var(--page-footer-gap));
    transition: background 0.3s ease;
}

.content-wrapper {
    max-width: 900px;
    margin: 0 auto;
    background: var(--bg-surface);
    border-radius: 16px;
    box-shadow: 0 10px 30px var(--shadow-color);
    overflow: hidden;
    transition: background 0.3s ease, box-shadow 0.3s ease;
}

/* 加载状态 */
.loading-state {
    padding: 40px;
}

.skeleton-header {
    margin-bottom: 30px;
}

.skeleton-title {
    height: 32px;
    width: 80%;
    background: var(--skeleton-gradient);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
    margin-bottom: 15px;
}

.skeleton-tags {
    display: flex;
    gap: 10px;
}

.skeleton-tag {
    height: 24px;
    width: 80px;
    background: var(--skeleton-gradient);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 12px;
}

.skeleton-meta {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
}

.skeleton-meta-item {
    height: 16px;
    width: 150px;
    background: var(--skeleton-gradient);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

.skeleton-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.skeleton-section {
    height: 120px;
    background: var(--skeleton-gradient);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* 事件详情 */
.event-detail {
    padding: 40px;
}

.event-header {
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 2px solid var(--border-color);
    transition: border-color 0.3s ease;
}

.event-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 20px 0;
    line-height: 1.2;
    transition: color 0.3s ease;
}

.event-tags {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.event-tag {
    padding: 6px 16px;
    background: var(--gradient-primary);
    color: white;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
}

.event-meta {
    display: flex;
    gap: 30px;
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 0.95rem;
    transition: color 0.3s ease;
}

.meta-item i {
    color: var(--accent-color);
    font-size: 1rem;
    transition: color 0.3s ease;
}

/* 信息卡片 */
.info-card,
.description-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 30px;
    border: 1px solid var(--border-color);
    transition: background 0.3s ease, border-color 0.3s ease;
}

.card-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 20px 0;
    transition: color 0.3s ease;
}

.card-title i {
    color: var(--accent-color);
    font-size: 1.2rem;
    transition: color 0.3s ease;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.info-item {
    background: var(--bg-surface);
    padding: 20px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    transition: background 0.3s ease, border-color 0.3s ease;
}

.info-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 8px;
    font-weight: 500;
    transition: color 0.3s ease;
}

.info-value {
    font-size: 1rem;
    color: var(--text-primary);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.3s ease;
}

.info-value i {
    color: var(--accent-color);
    transition: color 0.3s ease;
}

.description-content {
    line-height: 1.7;
    color: var(--text-primary);
    transition: color 0.3s ease;
}

.description-content h1,
.description-content h2,
.description-content h3,
.description-content h4,
.description-content h5,
.description-content h6 {
    color: var(--text-primary);
    margin: 1.5rem 0 1rem 0;
    font-weight: 600;
    transition: color 0.3s ease;
}

.description-content p {
    margin: 1rem 0;
}

.description-content ul,
.description-content ol {
    margin: 1rem 0;
    padding-left: 1.5rem;
}

.description-content li {
    margin: 0.5rem 0;
}

.description-content img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1.5rem 0;
    box-shadow: 0 4px 12px var(--shadow-color);
    transition: box-shadow 0.3s ease;
}

.description-content blockquote {
    border-left: 4px solid var(--accent-color);
    padding-left: 1rem;
    margin: 1.5rem 0;
    background: rgba(102, 126, 234, 0.05);
    padding: 1rem;
    border-radius: 0 8px 8px 0;
    transition: border-color 0.3s ease, background 0.3s ease;
}

.dark .description-content blockquote {
    background: rgba(66, 165, 245, 0.05);
}

.description-content code {
    background: var(--bg-secondary);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9rem;
    transition: background 0.3s ease;
}

.description-content pre {
    background: var(--bg-secondary);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid var(--border-color);
    transition: background 0.3s ease, border-color 0.3s ease;
}

.description-content pre code {
    background: none;
    padding: 0;
}

/* 错误状态 */
.error-state {
    text-align: center;
    padding: 60px 40px;
    color: var(--text-secondary);
    transition: color 0.3s ease;
}

.error-icon {
    font-size: 3rem;
    color: #ff6b6b;
    margin-bottom: 20px;
}

.error-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 10px 0;
    transition: color 0.3s ease;
}

.error-message {
    font-size: 1rem;
    margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .event-detail-container {
        padding: 20px 15px calc(20px + var(--page-footer-gap));
    }
    
    .event-detail {
        padding: 25px;
    }
    
    .event-title {
        font-size: 2rem;
    }
    
    .event-meta {
        flex-direction: column;
        gap: 15px;
    }
    
    .info-grid {
        grid-template-columns: 1fr;
    }
    
    .info-card,
    .description-card {
        padding: 20px;
    }
}
</style>
