<script setup>
import { useRoute } from 'vue-router'
import { ref, inject, onMounted } from 'vue'
import { processMarkdownImages, processImageUrl } from '@/utils/imageUtils'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

const route = useRoute()
const nid = route.params.id

const axios = inject('axios')

const data = ref(null)
const loading = ref(true)

const fetchNewsDetail = async () => {
    loading.value = true
    try {
        const response = await axios.get('/news/detail', {
            params: {
                nid: nid,
            },
        })
        // 处理图片URL
        const processedData = {
            ...response.data,
            content: processMarkdownImages(response.data.content),
            image: processImageUrl(response.data.image)
        }
        data.value = processedData
    } catch (error) {
        console.error('获取新闻详情失败:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchNewsDetail()
})
</script>

<template>
    <div class="news-detail-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
            <div class="skeleton-header">
                <div class="skeleton-title"></div>
                <div class="skeleton-meta">
                    <div class="skeleton-author"></div>
                    <div class="skeleton-date"></div>
                </div>
                <div class="skeleton-tags">
                    <div class="skeleton-tag"></div>
                    <div class="skeleton-tag"></div>
                </div>
            </div>
            <div class="skeleton-content">
                <div class="skeleton-paragraph"></div>
                <div class="skeleton-paragraph"></div>
                <div class="skeleton-paragraph"></div>
                <div class="skeleton-paragraph"></div>
            </div>
        </div>

        <!-- 新闻详情 -->
        <div v-else-if="data" class="news-detail">
            <!-- 新闻头部 -->
            <div class="news-header">
                <div class="news-category">
                    <i class="pi pi-newspaper"></i>
                    <span>新闻资讯</span>
                </div>
                
                <h1 class="news-title">{{ data.title }}</h1>
                
                
                    <div class="meta-item">
                        <i class="pi pi-calendar"></i>
                        <span>发布时间：{{ new Date(data.first_publish * 1000).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) }}</span>
                    </div>
                    
                </div>

                <div class="news-tags" v-if="data.tag">
                    <span 
                        v-for="tag in data.tag.split(' ')" 
                        :key="tag"
                        class="news-tag"
                    >
                        {{ tag }}
                    </span>
                </div>
            </div>

            <!-- 新闻内容 -->
            <div class="news-content">
                <MarkdownRenderer :content="data.content" />
            </div>

            <!-- 新闻底部 -->
            <div class="news-footer">
                <div class="footer-divider"></div>
                <div class="footer-info">
                    <!-- <div class="info-item">
                        <i class="pi pi-share-alt"></i>
                        <span>分享到：</span>
                        <div class="share-buttons">
                            <button class="share-btn wechat">
                                <i class="pi pi-comments"></i>
                                微信
                            </button>
                            <button class="share-btn weibo">
                                <i class="pi pi-globe"></i>
                                微博
                            </button>
                        </div>
                    </div> -->
                    <div class="info-item">
                        <i class="pi pi-arrow-left"></i>
                        <router-link to="/news" class="back-link">
                            返回新闻列表
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <!-- 错误状态 -->
        <div v-else class="error-state">
            <div class="error-icon">
                <i class="pi pi-exclamation-triangle"></i>
            </div>
            <h3 class="error-title">新闻不存在</h3>
            <p class="error-message">抱歉，您访问的新闻内容不存在或已被删除</p>
            <router-link to="/news" class="back-btn">
                <i class="pi pi-arrow-left"></i>
                返回新闻列表
            </router-link>
        </div>
    </div>
</template>

<style scoped>
.news-detail-container {
    min-height: 100vh;
    background: #f8f9fa;
    padding: 0;
}

/* 加载状态 */
.loading-state {
    max-width: 1000px;
    margin: 0 auto;
    background: white;
    padding: 40px;
}

.skeleton-header {
    margin-bottom: 40px;
}

.skeleton-title {
    height: 40px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
    margin-bottom: 20px;
}

.skeleton-meta {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.skeleton-author,
.skeleton-date {
    height: 16px;
    width: 120px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

.skeleton-tags {
    display: flex;
    gap: 10px;
}

.skeleton-tag {
    height: 24px;
    width: 80px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 12px;
}

.skeleton-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.skeleton-paragraph {
    height: 16px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

.skeleton-paragraph:nth-child(2) {
    width: 90%;
}

.skeleton-paragraph:nth-child(3) {
    width: 85%;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* 新闻详情 */
.news-detail {
    max-width: 1000px;
    margin: 0 auto;
    background: white;
    overflow: hidden;
}

.news-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px;
    text-align: center;
}

.news-category {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.2);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 20px;
}

.news-title {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.3;
    margin: 0 0 30px 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.news-meta {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-bottom: 25px;
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.95rem;
    opacity: 0.9;
}

.meta-item i {
    font-size: 1rem;
}

.news-tags {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
}

.news-tag {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.news-content {
    padding: 40px;
}

/* Markdown渲染器样式已移至MarkdownRenderer组件 */

.news-footer {
    background: #f8f9fa;
    padding: 30px 40px;
    border-top: 1px solid #e9ecef;
}

.footer-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #667eea, transparent);
    margin-bottom: 25px;
}

.footer-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 0.95rem;
}

.info-item i {
    color: #667eea;
}

.share-buttons {
    display: flex;
    gap: 10px;
}

.share-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border: 1px solid #e9ecef;
    background: white;
    border-radius: 20px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.share-btn.wechat:hover {
    background: #07c160;
    color: white;
    border-color: #07c160;
}

.share-btn.weibo:hover {
    background: #e6162d;
    color: white;
    border-color: #e6162d;
}

.back-link {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;
}

.back-link:hover {
    color: #764ba2;
}

/* 错误状态 */
.error-state {
    max-width: 500px;
    margin: 100px auto;
    text-align: center;
    background: white;
    padding: 60px 40px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.error-icon {
    font-size: 4rem;
    color: #ff6b6b;
    margin-bottom: 20px;
}

.error-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 15px 0;
}

.error-message {
    color: #666;
    font-size: 1rem;
    margin: 0 0 30px 0;
    line-height: 1.6;
}

.back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-decoration: none;
    border-radius: 25px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.back-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .news-detail-container {
        padding: 0 20px;
    }
    
    .news-detail {
        max-width: 100%;
    }
    
    .news-header {
        padding: 30px 20px;
    }
    
    .news-title {
        font-size: 2rem;
    }
    
    .news-meta {
        flex-direction: column;
        gap: 15px;
    }
    
    .news-content {
        padding: 30px 20px;
    }
    
    .content-body {
        font-size: 1rem;
    }
    
    .content-body pre {
        padding: 1rem;
        font-size: 0.8rem;
    }
    
    .content-body table {
        font-size: 0.8rem;
    }
    
    .content-body th,
    .content-body td {
        padding: 8px 12px;
    }
    
    .news-footer {
        padding: 25px 20px;
    }
    
    .footer-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
    
    .share-buttons {
        margin-top: 10px;
    }
}
</style>
