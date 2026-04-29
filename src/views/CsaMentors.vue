<!--
职责范围：渲染教师介绍页 `/mentors` 的列表主页、同步状态说明和本地数据状态。
功能边界：本页面只展示四位白名单教师的主页概览，不承载详情页布局、正式资料审校或后端同步逻辑。
-->

<script setup>
import { computed, onMounted, ref } from 'vue'

import { mentorsListResponse } from '@/assets/data/mentors'

const loading = ref(true)
const errorMessage = ref('')
const mentors = ref([])
const syncMeta = ref(mentorsListResponse.meta)

const visibleMentors = computed(() => mentors.value)

const syncStatusLabel = computed(() => {
    if (syncMeta.value.source_status === 'manual_seed') {
        return '临时数据'
    }

    if (syncMeta.value.source_status === 'synced') {
        return '数据已同步'
    }

    if (syncMeta.value.source_status === 'failed') {
        return '同步异常'
    }

    return '待同步'
})

const lastSyncedText = computed(() => {
    if (!syncMeta.value.last_synced_at) {
        return '待后端同步接入'
    }

    return new Date(syncMeta.value.last_synced_at).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
})

const getInitial = name => name.slice(0, 1)

const loadMentors = () => {
    loading.value = true
    errorMessage.value = ''

    try {
        mentors.value = mentorsListResponse.items
        syncMeta.value = mentorsListResponse.meta
    } catch (error) {
        console.error('加载教师数据失败:', error)
        errorMessage.value = '教师数据暂时不可用，请稍后再试。'
        mentors.value = []
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadMentors()
})
</script>

<template>
    <main class="mentors-page">
        <section class="mentors-intro" aria-labelledby="mentors-title">
            <div class="mentors-intro__content">
                <p class="mentors-eyebrow">CSA Research Mentors</p>
                <h1 id="mentors-title">教师介绍</h1>
                <p class="mentors-lead">
                    面向协会成员的科研方向与教师主页导航，聚焦当前重点对接的四位教师。
                </p>
            </div>

            <aside class="mentors-sync" aria-label="数据来源状态">
                <div class="mentors-sync__status">
                    <span class="mentors-sync__dot" aria-hidden="true"></span>
                    <span>{{ syncStatusLabel }}</span>
                </div>
                <dl>
                    <div>
                        <dt>更新时间</dt>
                        <dd>{{ lastSyncedText }}</dd>
                    </div>
                    <div>
                        <dt>来源</dt>
                        <dd>{{ syncMeta.source_url || '公开资料整理中' }}</dd>
                    </div>
                </dl>
            </aside>
        </section>

        <section class="mentors-content" aria-label="教师列表">
            <div v-if="loading" class="mentors-grid" aria-live="polite">
                <article v-for="index in 4" :key="index" class="mentor-card mentor-card--skeleton">
                    <div class="mentor-card__avatar skeleton"></div>
                    <div class="mentor-card__body">
                        <div class="skeleton mentor-card__line mentor-card__line--name"></div>
                        <div class="skeleton mentor-card__line mentor-card__line--title"></div>
                        <div class="mentor-card__tags">
                            <span class="skeleton mentor-card__tag"></span>
                            <span class="skeleton mentor-card__tag"></span>
                            <span class="skeleton mentor-card__tag"></span>
                        </div>
                        <div class="skeleton mentor-card__line mentor-card__line--summary"></div>
                    </div>
                </article>
            </div>

            <div v-else-if="errorMessage" class="mentors-state" role="alert">
                <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
                <h2>数据加载失败</h2>
                <p>{{ errorMessage }}</p>
            </div>

            <div v-else-if="visibleMentors.length === 0" class="mentors-state">
                <i class="pi pi-info-circle" aria-hidden="true"></i>
                <h2>暂无教师数据</h2>
                <p>教师资料正在整理中。</p>
            </div>

            <div v-else class="mentors-grid">
                <router-link
                    v-for="mentor in visibleMentors"
                    :key="mentor.id"
                    :to="{ name: 'mentor_detail', params: { id: mentor.id } }"
                    class="mentor-card mentor-card--link"
                    :aria-label="`查看${mentor.name}教师详情`"
                >
                    <div class="mentor-card__avatar" aria-hidden="true">
                        <img
                            v-if="mentor.avatar_url"
                            :src="mentor.avatar_url"
                            :alt="`${mentor.name}头像`"
                            loading="lazy"
                        />
                        <span v-else>{{ getInitial(mentor.name) }}</span>
                    </div>

                    <div class="mentor-card__body">
                        <div class="mentor-card__heading">
                            <h2>{{ mentor.name }}</h2>
                            <p>{{ mentor.title || '职称信息待补充' }}</p>
                        </div>

                        <div class="mentor-card__tags" aria-label="研究方向">
                            <span
                                v-for="area in mentor.research_areas.slice(0, 5)"
                                :key="area"
                                class="mentor-card__tag"
                            >
                                {{ area }}
                            </span>
                            <span v-if="mentor.research_areas.length === 0" class="mentor-card__tag mentor-card__tag--muted">
                                研究方向待补充
                            </span>
                        </div>

                        <p class="mentor-card__summary">
                            {{ mentor.summary || '公开资料将在内容审校阶段单独补充。' }}
                        </p>

                        <div class="mentor-card__meta">
                            <span>
                                <i class="pi pi-building" aria-hidden="true"></i>
                                {{ mentor.affiliation || '单位信息待补充' }}
                            </span>
                            <span>
                                <i class="pi pi-database" aria-hidden="true"></i>
                                {{ mentor.source_status === 'manual_seed' ? '临时 seed' : mentor.source_status }}
                            </span>
                        </div>

                        <div class="mentor-card__action">
                            <span>查看详情</span>
                            <i class="pi pi-arrow-right" aria-hidden="true"></i>
                        </div>
                    </div>
                </router-link>
            </div>
        </section>
    </main>
</template>

<style scoped>
.mentors-page {
    min-height: 100%;
    padding: 0 0 var(--page-footer-gap);
    background:
        linear-gradient(180deg, rgba(102, 126, 234, 0.04) 0%, rgba(102, 126, 234, 0) 260px),
        var(--bg-secondary);
    color: var(--text-primary);
}

:global(.dark) .mentors-page {
    background:
        radial-gradient(circle at top center, rgba(96, 165, 250, 0.1) 0%, rgba(96, 165, 250, 0) 30%),
        linear-gradient(180deg, #0f172a 0%, #172335 34%, #1b2738 100%);
}

.mentors-intro,
.mentors-content {
    width: min(1120px, calc(100% - 40px));
    margin: 0 auto;
}

.mentors-intro {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 32px;
    align-items: end;
    padding: 48px 0 36px;
}

.mentors-eyebrow {
    margin: 0 0 12px;
    color: var(--accent-color);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0;
}

.mentors-intro h1 {
    margin: 0;
    color: var(--text-primary);
    font-size: 2.35rem;
    line-height: 1.18;
    letter-spacing: 0;
}

.mentors-lead {
    max-width: 640px;
    margin: 14px 0 0;
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.75;
}

.mentors-sync {
    padding: 20px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: rgba(var(--bg-surface-rgb), 0.72);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

:global(.dark) .mentors-sync {
    background: rgba(35, 49, 71, 0.62);
    box-shadow: none;
}

.mentors-sync__status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    color: var(--text-primary);
    font-size: 0.9rem;
    font-weight: 650;
}

.mentors-sync__dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
}

.mentors-sync dl {
    display: grid;
    gap: 12px;
    margin: 0;
}

.mentors-sync dt {
    margin-bottom: 2px;
    color: var(--text-secondary);
    font-size: 0.78rem;
}

.mentors-sync dd {
    margin: 0;
    color: var(--text-primary);
    font-size: 0.9rem;
    line-height: 1.5;
    overflow-wrap: anywhere;
}

.mentors-content {
    padding-bottom: 48px;
}

.mentors-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
}

.mentor-card {
    display: grid;
    grid-template-columns: 112px minmax(0, 1fr);
    gap: 22px;
    min-height: 232px;
    padding: 24px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-surface);
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.045);
    transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease,
        box-shadow 0.2s ease;
}

.mentor-card--link {
    color: inherit;
    text-decoration: none;
}

.mentor-card:hover {
    transform: translateY(-2px);
    border-color: rgba(102, 126, 234, 0.26);
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.075);
}

.mentor-card:focus-visible {
    outline: 2px solid rgba(102, 126, 234, 0.28);
    outline-offset: 3px;
}

:global(.dark) .mentor-card {
    background: rgba(35, 49, 71, 0.86);
    box-shadow: none;
}

:global(.dark) .mentor-card:hover {
    border-color: rgba(96, 165, 250, 0.34);
    background: rgba(39, 55, 78, 0.92);
    box-shadow: none;
}

.mentor-card__avatar {
    width: 112px;
    height: 144px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--accent-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    flex-shrink: 0;
}

.mentor-card__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.mentor-card__body {
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.mentor-card__heading h2 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.35rem;
    line-height: 1.25;
    letter-spacing: 0;
}

.mentor-card__heading p {
    margin: 6px 0 0;
    color: var(--text-secondary);
    font-size: 0.93rem;
    line-height: 1.5;
}

.mentor-card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
}

.mentor-card__tag {
    max-width: 100%;
    min-height: 28px;
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border: 1px solid rgba(102, 126, 234, 0.16);
    border-radius: 6px;
    background: rgba(102, 126, 234, 0.08);
    color: var(--accent-color);
    font-size: 0.78rem;
    line-height: 1.35;
    overflow-wrap: anywhere;
}

.mentor-card__tag--muted {
    border-color: var(--border-color);
    background: var(--bg-secondary);
    color: var(--text-secondary);
}

.mentor-card__summary {
    margin: 16px 0 0;
    color: var(--text-secondary);
    font-size: 0.94rem;
    line-height: 1.65;
}

.mentor-card__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
    margin-top: auto;
    padding-top: 18px;
    color: var(--text-secondary);
    font-size: 0.82rem;
}

.mentor-card__meta span {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    overflow-wrap: anywhere;
}

.mentor-card__meta i {
    color: var(--accent-color);
    font-size: 0.82rem;
}

.mentor-card__action {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    color: var(--accent-color);
    font-size: 0.86rem;
    font-weight: 650;
}

.mentor-card__action i {
    font-size: 0.78rem;
}

.mentor-card--skeleton {
    pointer-events: none;
}

.mentor-card__line {
    height: 14px;
}

.mentor-card__line--name {
    width: 104px;
    height: 22px;
}

.mentor-card__line--title {
    width: 168px;
    margin-top: 12px;
}

.mentor-card__line--summary {
    width: 100%;
    margin-top: 18px;
}

.mentor-card--skeleton .mentor-card__tag {
    width: 72px;
    border: 0;
}

.mentors-state {
    display: flex;
    min-height: 320px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 20px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-surface);
    text-align: center;
}

.mentors-state i {
    margin-bottom: 16px;
    color: var(--accent-color);
    font-size: 2rem;
}

.mentors-state h2 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.25rem;
    letter-spacing: 0;
}

.mentors-state p {
    max-width: 420px;
    margin: 10px 0 0;
    color: var(--text-secondary);
    line-height: 1.65;
}

@media (max-width: 960px) {
    .mentors-intro {
        grid-template-columns: 1fr;
        align-items: start;
    }

    .mentors-sync {
        max-width: 520px;
    }

    .mentors-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .mentors-intro,
    .mentors-content {
        width: min(100% - 28px, 1120px);
    }

    .mentors-intro {
        padding: 36px 0 28px;
        gap: 24px;
    }

    .mentors-intro h1 {
        font-size: 2rem;
    }

    .mentor-card {
        grid-template-columns: 88px minmax(0, 1fr);
        gap: 16px;
        min-height: 0;
        padding: 18px;
    }

    .mentor-card__avatar {
        width: 88px;
        height: 112px;
    }

    .mentor-card__heading h2 {
        font-size: 1.18rem;
    }

    .mentor-card__tags {
        margin-top: 12px;
    }

    .mentor-card__summary,
    .mentor-card__meta {
        grid-column: 1 / -1;
    }
}
</style>
