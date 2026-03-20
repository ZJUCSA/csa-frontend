<script setup>
import { computed, inject, onMounted, ref } from 'vue'

const axios = inject('axios')

const data1 = ref([])
const data2 = ref([])
const data3 = ref([])
const loading = ref(true)

const fetchCategory = async category => {
    const response = await axios.get('/news/list', {
        params: { page: 1, size: 6, category },
    })
    return response.data || []
}

const fetchData = async () => {
    const [noticeResult, knowledgeResult, contestResult] = await Promise.allSettled([
        fetchCategory(2),
        fetchCategory(3),
        fetchCategory(5),
    ])

    data1.value = noticeResult.status === 'fulfilled' ? noticeResult.value : []
    data2.value = knowledgeResult.status === 'fulfilled' ? knowledgeResult.value : []
    data3.value = contestResult.status === 'fulfilled' ? contestResult.value : []

    if (noticeResult.status === 'rejected') {
        console.error('获取通知公告失败:', noticeResult.reason)
    }
    if (knowledgeResult.status === 'rejected') {
        console.error('获取网安知识失败:', knowledgeResult.reason)
    }
    if (contestResult.status === 'rejected') {
        console.error('获取赛事信息失败:', contestResult.reason)
    }

    loading.value = false
}

const sections = computed(() => [
    {
        key: 'notice',
        title: '通知公告',
        subtitle: 'Announcement & Notice',
        emptyText: '暂无通知公告',
        items: data1.value,
    },
    {
        key: 'knowledge',
        title: '网安知识',
        subtitle: 'Cyber Security Knowledge',
        emptyText: '暂无网安知识',
        items: data2.value,
    },
    {
        key: 'contest',
        title: '赛事信息',
        subtitle: 'Contest Information',
        emptyText: '暂无赛事信息',
        items: data3.value,
    },
])

const formatDate = timestamp =>
    new Date(timestamp * 1000).toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
    })

onMounted(() => {
    fetchData()
})
</script>

<template>
    <div class="info-layout">
        <div
            v-for="(section, sectionIndex) in sections"
            :key="section.key"
            class="info-section"
        >
            <div class="section-header">
                <h3 class="section-title">{{ section.title }}</h3>
                <p class="section-subtitle">{{ section.subtitle }}</p>
            </div>

            <div class="info-list">
                <div v-if="!loading && section.items.length > 0" class="list-content">
                    <div
                        v-for="(item, index) in section.items"
                        :key="item.nid"
                        class="list-item"
                        :style="{
                            animationDelay: `${sectionIndex * 0.08 + index * 0.07}s`,
                            '--item-enter-x': '-18px',
                        }"
                    >
                        <router-link
                            class="item-link"
                            :to="{ name: 'news', params: { id: item.nid } }"
                        >
                            <span class="item-title">{{ item.title }}</span>
                            <span class="item-date">
                                {{ formatDate(item.first_publish) }}
                            </span>
                        </router-link>
                    </div>
                </div>

                <div v-else-if="loading" class="loading-state">
                    <div v-for="i in 6" :key="i" class="skeleton-item">
                        <div class="skeleton-title"></div>
                        <div class="skeleton-date"></div>
                    </div>
                </div>

                <div v-else class="empty-state">
                    <p class="empty-text">{{ section.emptyText }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.info-layout {
    position: relative;
    display: flex;
    width: 100%;
    overflow: hidden;
    border-radius: 20px;
    border: 1px solid var(--border-color);
    background: var(--bg-surface);
    box-shadow: 0 10px 30px var(--shadow-color);
    animation: panelFadeIn 0.7s ease-out both;
    transition: all 0.3s ease;
    will-change: transform, box-shadow;
}

.info-layout:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px var(--shadow-color);
}

.info-layout::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
}

.info-layout::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
    pointer-events: none;
}

.info-section {
    position: relative;
    flex: 1 1 0%;
    min-height: 360px;
    padding: 28px 24px 24px;
    display: flex;
    flex-direction: column;
    background: transparent;
}

.info-section:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 28px;
    bottom: 24px;
    width: 1px;
    background: linear-gradient(
        180deg,
        rgba(102, 126, 234, 0) 0%,
        rgba(102, 126, 234, 0.12) 14%,
        rgba(102, 126, 234, 0.12) 86%,
        rgba(102, 126, 234, 0) 100%
    );
}

.section-header {
    margin-bottom: 18px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(102, 126, 234, 0.08);
}

.section-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 5px;
}

.section-subtitle {
    font-size: 0.86rem;
    color: var(--text-secondary);
    margin: 0;
    letter-spacing: 0.01em;
}

.info-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
}

.list-content,
.loading-state,
.empty-state {
    flex: 1;
}

.list-content {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
}

.list-item {
    list-style: none;
    position: relative;
    opacity: 0;
    transform: translateX(var(--item-enter-x, -18px));
    animation: listItemReveal 0.72s cubic-bezier(0.22, 1, 0.36, 1) both;
    will-change: opacity, transform;
}

.list-item:not(:last-child),
.skeleton-item:not(:last-child) {
    border-bottom: 1px solid rgba(102, 126, 234, 0.08);
}

@keyframes panelFadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes listItemReveal {
    from {
        opacity: 0;
        transform: translateX(var(--item-enter-x, -18px));
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.item-link {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 56px;
    align-items: center;
    gap: 10px;
    padding: 12px 8px 12px 3px;
    text-decoration: none;
    color: var(--text-primary);
    border-radius: 10px;
    border: 1px solid transparent;
    background: transparent;
    box-shadow: inset 0 0 0 1px transparent;
    transition:
        background-color 0.24s ease,
        color 0.24s ease,
        padding-left 0.18s ease,
        box-shadow 0.24s ease;
}

.item-link::before {
    content: none;
}

.item-link:hover {
    background: linear-gradient(
        90deg,
        rgba(102, 126, 234, 0.08) 0%,
        rgba(102, 126, 234, 0.04) 24%,
        rgba(102, 126, 234, 0.015) 100%
    );
    padding-left: 8px;
    box-shadow: inset 2px 0 0 rgba(102, 126, 234, 0.24);
}

.item-link:hover .item-title {
    color: var(--accent-color);
}

.item-title {
    min-width: 0;
    font-size: 0.95rem;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.5;
    transition: color 0.18s ease;
}

.item-date {
    font-size: 0.82rem;
    color: var(--text-secondary);
    text-align: right;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
}

.loading-state {
    display: flex;
    flex-direction: column;
}

.skeleton-item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 56px;
    align-items: center;
    gap: 10px;
    padding: 12px 8px 12px 3px;
}

.skeleton-title {
    height: 14px;
    width: 72%;
    background-color: var(--bg-secondary);
    border-radius: 999px;
    animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-date {
    justify-self: end;
    height: 14px;
    width: 42px;
    background-color: var(--bg-secondary);
    border-radius: 999px;
    animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
    0% {
        opacity: 0.45;
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 0.45;
    }
}

.empty-state {
    display: flex;
    min-height: 220px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px 10px;
}

.empty-text {
    color: var(--text-secondary);
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
}

@media (max-width: 992px) {
    .info-layout {
        flex-direction: column;
    }

    .info-section {
        min-height: 320px;
    }

    .info-section:not(:last-child)::after {
        content: none;
    }

    .info-section:not(:last-child) {
        border-bottom: 1px solid rgba(102, 126, 234, 0.08);
    }
}

@media (max-width: 768px) {
    .info-layout {
        border-radius: 18px;
    }

    .info-section {
        padding: 24px 18px 18px;
    }

    .section-title {
        font-size: 1.18rem;
    }

    .section-subtitle {
        font-size: 0.82rem;
    }

    .item-link,
    .skeleton-item {
        grid-template-columns: minmax(0, 1fr) 48px;
        gap: 10px;
        padding: 11px 6px 11px 2px;
    }

    .item-title {
        font-size: 0.92rem;
    }

    .item-date {
        font-size: 0.78rem;
    }
}
</style>
