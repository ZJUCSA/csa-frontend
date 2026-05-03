<!--
职责范围：渲染教师介绍页 `/mentors` 的公开列表主页、资料更新时间和教师卡片入口。
功能边界：本页面展示当前公开的重点对接教师主页概览，不承载详情页布局、后台审校或后端同步逻辑。
-->

<script setup>
import { computed, inject, onMounted, ref } from 'vue'

const DEFAULT_SYNC_META = {
    last_synced_at: '',
    source_url: '',
}

const axios = inject('axios')
const loading = ref(true)
const errorMessage = ref('')
const mentors = ref([])
const syncMeta = ref(DEFAULT_SYNC_META)
const failedAvatarIds = ref(new Set())

const visibleMentors = computed(() => mentors.value)

const formatPublicDate = value => {
    if (!value) return '资料更新时间待确认'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
}

const lastSyncedText = computed(() => {
    return formatPublicDate(syncMeta.value.last_synced_at)
})

const getInitial = name => name.slice(0, 1)

const shouldShowAvatar = mentor =>
    Boolean(mentor.avatar_url) && !failedAvatarIds.value.has(mentor.id)

const markAvatarFailed = id => {
    const nextFailedIds = new Set(failedAvatarIds.value)
    nextFailedIds.add(id)
    failedAvatarIds.value = nextFailedIds
}

const loadMentors = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = await axios.get('/teachers/list')
        mentors.value = response.data.items || []
        syncMeta.value = response.data.meta || DEFAULT_SYNC_META
    } catch (error) {
        console.error('加载教师数据失败:', error)
        errorMessage.value = '教师数据暂时不可用，请稍后再试。'
        mentors.value = []
        syncMeta.value = DEFAULT_SYNC_META
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

            <aside class="mentors-update" aria-label="资料更新时间">
                <div class="mentors-update__icon" aria-hidden="true">
                    <i class="pi pi-clock"></i>
                </div>
                <div>
                    <p>资料更新于</p>
                    <strong>{{ lastSyncedText }}</strong>
                    <span>招生和项目安排以教师本人及学院发布信息为准。</span>
                </div>
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
                    <div class="mentor-card__avatar">
                        <img
                            v-if="shouldShowAvatar(mentor)"
                            :src="mentor.avatar_url"
                            :alt="`${mentor.name}头像`"
                            loading="lazy"
                            @error="markAvatarFailed(mentor.id)"
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
                            {{ mentor.summary || '公开资料待补充。' }}
                        </p>

                        <div class="mentor-card__meta">
                            <span>
                                <i class="pi pi-building" aria-hidden="true"></i>
                                {{ mentor.affiliation || '单位信息待补充' }}
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

.mentors-update {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr);
    gap: 14px;
    padding: 20px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: rgba(var(--bg-surface-rgb), 0.72);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

:global(.dark) .mentors-update {
    background: rgba(35, 49, 71, 0.62);
    box-shadow: none;
}

.mentors-update__icon {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(102, 126, 234, 0.16);
    border-radius: 8px;
    background: rgba(102, 126, 234, 0.08);
    color: var(--accent-color);
}

.mentors-update p {
    margin: 0 0 4px;
    color: var(--text-secondary);
    font-size: 0.78rem;
}

.mentors-update strong {
    display: block;
    color: var(--text-primary);
    font-size: 1rem;
    line-height: 1.5;
}

.mentors-update span {
    display: block;
    margin-top: 8px;
    color: var(--text-secondary);
    font-size: 0.82rem;
    line-height: 1.55;
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

    .mentors-update {
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
