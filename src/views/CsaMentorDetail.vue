<!--
职责范围：渲染教师介绍页 `/mentors/:id` 的单位教师详情、联系方式、来源状态和空字段说明。
功能边界：本页面只负责详情页展示结构和状态处理，不负责正式资料审校、后端同步或教师数据编辑。
-->

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getMentorDetailResponse } from '@/assets/data/mentors'

const route = useRoute()

const loading = ref(true)
const errorMessage = ref('')
const mentor = ref(null)
const syncMeta = ref({})

const sourceStatusText = computed(() => {
    const status = mentor.value?.source_status || syncMeta.value?.source_status

    if (status === 'manual_seed') {
        return '临时数据'
    }

    if (status === 'synced') {
        return '数据已同步'
    }

    if (status === 'failed') {
        return '同步异常'
    }

    return '待同步'
})

const lastSyncedText = computed(() => {
    const value = mentor.value?.last_synced_at || syncMeta.value?.last_synced_at

    if (!value) {
        return '待后端同步接入'
    }

    return new Date(value).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
})

const homepageLinks = computed(() => mentor.value?.homepage_urls || [])
const researchAreas = computed(() => mentor.value?.research_areas || [])
const profileSections = computed(() => mentor.value?.profile_sections || [])

const sourceUrl = computed(() => mentor.value?.source_url || syncMeta.value?.source_url || '')

const getInitial = name => (name ? name.slice(0, 1) : '?')

const loadMentor = id => {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = getMentorDetailResponse(id)
        mentor.value = response.item
        syncMeta.value = response.meta

        if (!response.item) {
            errorMessage.value = '未找到对应教师资料。'
        }
    } catch (error) {
        console.error('加载教师详情失败:', error)
        mentor.value = null
        errorMessage.value = '教师详情暂时不可用，请稍后再试。'
    } finally {
        loading.value = false
    }
}

watch(
    () => route.params.id,
    id => {
        loadMentor(id)
    },
    { immediate: true }
)
</script>

<template>
    <main class="mentor-detail-page">
        <div class="mentor-detail-shell">
            <router-link :to="{ name: 'mentors' }" class="mentor-back-link">
                <i class="pi pi-arrow-left" aria-hidden="true"></i>
                返回教师介绍
            </router-link>

            <div v-if="loading" class="mentor-detail-layout" aria-live="polite">
                <aside class="mentor-summary mentor-summary--skeleton">
                    <div class="mentor-summary__avatar skeleton"></div>
                    <div class="skeleton mentor-summary__line mentor-summary__line--name"></div>
                    <div class="skeleton mentor-summary__line"></div>
                    <div class="skeleton mentor-summary__line mentor-summary__line--short"></div>
                </aside>
                <section class="mentor-detail-main">
                    <div class="mentor-section">
                        <div class="skeleton mentor-detail__title"></div>
                        <div class="skeleton mentor-detail__paragraph"></div>
                        <div class="skeleton mentor-detail__paragraph mentor-detail__paragraph--short"></div>
                    </div>
                </section>
            </div>

            <section v-else-if="errorMessage" class="mentor-state" role="alert">
                <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
                <h1>无法打开教师详情</h1>
                <p>{{ errorMessage }}</p>
                <router-link :to="{ name: 'mentors' }" class="mentor-state__action">
                    返回教师列表
                </router-link>
            </section>

            <div v-else class="mentor-detail-layout">
                <aside class="mentor-summary" aria-label="教师身份摘要">
                    <div class="mentor-summary__avatar">
                        <img
                            v-if="mentor.avatar_url"
                            :src="mentor.avatar_url"
                            :alt="`${mentor.name}头像`"
                        />
                        <span v-else>{{ getInitial(mentor.name) }}</span>
                    </div>

                    <div class="mentor-summary__identity">
                        <p class="mentor-summary__eyebrow">Research Mentor</p>
                        <h1>{{ mentor.name }}</h1>
                        <p>{{ mentor.title || '职称信息待补充' }}</p>
                    </div>

                    <dl class="mentor-summary__facts">
                        <div>
                            <dt>所属单位</dt>
                            <dd>{{ mentor.affiliation || '单位信息待补充' }}</dd>
                        </div>
                        <div>
                            <dt>邮箱</dt>
                            <dd>
                                <a v-if="mentor.email" :href="`mailto:${mentor.email}`">
                                    {{ mentor.email }}
                                </a>
                                <span v-else>公开邮箱待补充</span>
                            </dd>
                        </div>
                        <div>
                            <dt>更新时间</dt>
                            <dd>{{ lastSyncedText }}</dd>
                        </div>
                    </dl>

                    <div class="mentor-summary__status">
                        <span class="mentor-summary__dot" aria-hidden="true"></span>
                        {{ sourceStatusText }}
                    </div>
                </aside>

                <section class="mentor-detail-main" aria-label="教师详情内容">
                    <header class="mentor-detail-header">
                        <p class="mentor-detail-header__label">教师主页</p>
                        <h2>{{ mentor.name }}的公开资料</h2>
                        <p>
                            本页用于汇总教师方向、联系方式和外部主页入口。正式内容将在资料审校阶段单独补充。
                        </p>
                    </header>

                    <section class="mentor-section">
                        <div class="mentor-section__heading">
                            <i class="pi pi-align-left" aria-hidden="true"></i>
                            <h3>简介</h3>
                        </div>
                        <p class="mentor-section__text">
                            {{ mentor.bio || mentor.summary || '公开简介待补充。' }}
                        </p>
                    </section>

                    <section class="mentor-section">
                        <div class="mentor-section__heading">
                            <i class="pi pi-tags" aria-hidden="true"></i>
                            <h3>研究方向</h3>
                        </div>
                        <div v-if="researchAreas.length > 0" class="mentor-area-list">
                            <span v-for="area in researchAreas" :key="area">
                                {{ area }}
                            </span>
                        </div>
                        <p v-else class="mentor-section__muted">
                            研究方向将在正式资料填充阶段补充。
                        </p>
                    </section>

                    <section class="mentor-section">
                        <div class="mentor-section__heading">
                            <i class="pi pi-external-link" aria-hidden="true"></i>
                            <h3>外部主页</h3>
                        </div>
                        <div v-if="homepageLinks.length > 0" class="mentor-link-list">
                            <a
                                v-for="link in homepageLinks"
                                :key="link.url"
                                :href="link.url"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span>{{ link.label || '外部链接' }}</span>
                                <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
                            </a>
                        </div>
                        <p v-else class="mentor-section__muted">
                            外部主页入口待补充。
                        </p>
                    </section>

                    <section v-if="profileSections.length > 0" class="mentor-section">
                        <div
                            v-for="section in profileSections"
                            :key="section.title"
                            class="mentor-profile-section"
                        >
                            <h3>{{ section.title }}</h3>
                            <p>{{ section.content }}</p>
                        </div>
                    </section>

                    <section class="mentor-section mentor-source">
                        <div class="mentor-section__heading">
                            <i class="pi pi-database" aria-hidden="true"></i>
                            <h3>来源说明</h3>
                        </div>
                        <dl>
                            <div>
                                <dt>主要来源</dt>
                                <dd>
                                    <a
                                        v-if="sourceUrl"
                                        :href="sourceUrl"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {{ sourceUrl }}
                                    </a>
                                    <span v-else>公开资料整理中</span>
                                </dd>
                            </div>
                            <div>
                                <dt>状态</dt>
                                <dd>{{ sourceStatusText }}</dd>
                            </div>
                            <div>
                                <dt>说明</dt>
                                <dd>{{ mentor.sync_note || syncMeta.sync_note || '暂无补充说明。' }}</dd>
                            </div>
                        </dl>
                    </section>
                </section>
            </div>
        </div>
    </main>
</template>

<style scoped>
.mentor-detail-page {
    min-height: 100%;
    padding: 40px 0 var(--page-footer-gap);
    background:
        linear-gradient(180deg, rgba(102, 126, 234, 0.04) 0%, rgba(102, 126, 234, 0) 280px),
        var(--bg-secondary);
    color: var(--text-primary);
}

:global(.dark) .mentor-detail-page {
    background:
        radial-gradient(circle at top center, rgba(96, 165, 250, 0.1) 0%, rgba(96, 165, 250, 0) 32%),
        linear-gradient(180deg, #0f172a 0%, #172335 34%, #1b2738 100%);
}

.mentor-detail-shell {
    width: min(1120px, calc(100% - 40px));
    margin: 0 auto;
}

.mentor-back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
    color: var(--text-secondary);
    font-size: 0.92rem;
    font-weight: 600;
    text-decoration: none;
}

.mentor-back-link:hover,
.mentor-back-link:focus-visible {
    color: var(--accent-color);
}

.mentor-detail-layout {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 32px;
    align-items: start;
}

.mentor-summary {
    position: sticky;
    top: 96px;
    padding: 24px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: rgba(var(--bg-surface-rgb), 0.84);
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.045);
}

:global(.dark) .mentor-summary {
    background: rgba(35, 49, 71, 0.8);
    box-shadow: none;
}

.mentor-summary__avatar {
    width: 160px;
    height: 200px;
    margin: 0 auto 22px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--accent-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.4rem;
    font-weight: 700;
}

.mentor-summary__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.mentor-summary__identity {
    text-align: center;
}

.mentor-summary__eyebrow {
    margin: 0 0 8px;
    color: var(--accent-color);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0;
}

.mentor-summary__identity h1 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.75rem;
    line-height: 1.2;
    letter-spacing: 0;
}

.mentor-summary__identity p {
    margin: 8px 0 0;
    color: var(--text-secondary);
    font-size: 0.94rem;
    line-height: 1.55;
}

.mentor-summary__facts {
    display: grid;
    gap: 14px;
    margin: 24px 0 0;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
}

.mentor-summary__facts dt {
    margin-bottom: 4px;
    color: var(--text-secondary);
    font-size: 0.78rem;
}

.mentor-summary__facts dd {
    margin: 0;
    color: var(--text-primary);
    font-size: 0.92rem;
    line-height: 1.5;
    overflow-wrap: anywhere;
}

.mentor-summary__status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
    padding: 8px 10px;
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 6px;
    background: rgba(16, 185, 129, 0.08);
    color: var(--text-primary);
    font-size: 0.84rem;
}

.mentor-summary__dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #10b981;
}

.mentor-detail-main {
    display: grid;
    gap: 20px;
    min-width: 0;
}

.mentor-detail-header,
.mentor-section,
.mentor-state {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-surface);
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
}

:global(.dark) .mentor-detail-header,
:global(.dark) .mentor-section,
:global(.dark) .mentor-state {
    background: rgba(35, 49, 71, 0.82);
    box-shadow: none;
}

.mentor-detail-header {
    padding: 28px;
}

.mentor-detail-header__label {
    margin: 0 0 10px;
    color: var(--accent-color);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0;
}

.mentor-detail-header h2 {
    margin: 0;
    color: var(--text-primary);
    font-size: 2rem;
    line-height: 1.25;
    letter-spacing: 0;
}

.mentor-detail-header p {
    max-width: 680px;
    margin: 12px 0 0;
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.75;
}

.mentor-section {
    padding: 24px 28px;
}

.mentor-section__heading {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
}

.mentor-section__heading i {
    color: var(--accent-color);
}

.mentor-section__heading h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.08rem;
    line-height: 1.35;
    letter-spacing: 0;
}

.mentor-section__text,
.mentor-section__muted,
.mentor-profile-section p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.96rem;
    line-height: 1.75;
}

.mentor-area-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.mentor-area-list span {
    max-width: 100%;
    min-height: 30px;
    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    border: 1px solid rgba(102, 126, 234, 0.16);
    border-radius: 6px;
    background: rgba(102, 126, 234, 0.08);
    color: var(--accent-color);
    font-size: 0.82rem;
    line-height: 1.35;
    overflow-wrap: anywhere;
}

.mentor-link-list {
    display: grid;
    gap: 10px;
}

.mentor-link-list a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 44px;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    text-decoration: none;
}

.mentor-link-list a:hover,
.mentor-link-list a:focus-visible {
    border-color: rgba(102, 126, 234, 0.3);
    color: var(--accent-color);
}

.mentor-profile-section + .mentor-profile-section {
    margin-top: 22px;
    padding-top: 22px;
    border-top: 1px solid var(--border-color);
}

.mentor-profile-section h3 {
    margin: 0 0 10px;
    color: var(--text-primary);
    font-size: 1.05rem;
    letter-spacing: 0;
}

.mentor-source dl {
    display: grid;
    gap: 12px;
    margin: 0;
}

.mentor-source dt {
    margin-bottom: 4px;
    color: var(--text-secondary);
    font-size: 0.78rem;
}

.mentor-source dd {
    margin: 0;
    color: var(--text-primary);
    font-size: 0.92rem;
    line-height: 1.55;
    overflow-wrap: anywhere;
}

.mentor-state {
    min-height: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    text-align: center;
}

.mentor-state i {
    margin-bottom: 16px;
    color: var(--accent-color);
    font-size: 2rem;
}

.mentor-state h1 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.6rem;
    letter-spacing: 0;
}

.mentor-state p {
    max-width: 420px;
    margin: 10px 0 0;
    color: var(--text-secondary);
    line-height: 1.65;
}

.mentor-state__action {
    margin-top: 20px;
    color: var(--accent-color);
    font-weight: 650;
}

.mentor-summary__line,
.mentor-detail__title,
.mentor-detail__paragraph {
    height: 14px;
}

.mentor-summary__line {
    margin: 12px auto 0;
    width: 80%;
}

.mentor-summary__line--name {
    height: 24px;
    width: 52%;
}

.mentor-summary__line--short {
    width: 60%;
}

.mentor-detail__title {
    width: 220px;
    height: 28px;
    margin-bottom: 22px;
}

.mentor-detail__paragraph {
    width: 100%;
    height: 16px;
    margin-top: 12px;
}

.mentor-detail__paragraph--short {
    width: 72%;
}

@media (max-width: 900px) {
    .mentor-detail-layout {
        grid-template-columns: 1fr;
    }

    .mentor-summary {
        position: static;
    }
}

@media (max-width: 640px) {
    .mentor-detail-page {
        padding-top: 28px;
    }

    .mentor-detail-shell {
        width: min(100% - 28px, 1120px);
    }

    .mentor-summary,
    .mentor-detail-header,
    .mentor-section {
        padding: 20px;
    }

    .mentor-summary__avatar {
        width: 132px;
        height: 168px;
    }

    .mentor-detail-header h2 {
        font-size: 1.55rem;
    }
}
</style>

