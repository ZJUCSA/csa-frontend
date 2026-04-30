<!--
职责范围：提供后台 `/admin/mentors` 教师介绍管理页，用于查看公开缓存、来源状态并手动触发同步。
功能边界：本页面不提供任意新增教师、删除教师或人工编辑资料；同步写入与权限校验由后端教师 API 负责。
-->

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { useConfirm } from 'primevue/useconfirm'

const DEFAULT_META = {
    last_synced_at: '',
    source_status: '',
    source_url: '',
    sync_note: '',
}

const axios = inject('axios')
const confirm = useConfirm()

const teachers = ref([])
const meta = ref({ ...DEFAULT_META })
const loading = ref(false)
const syncing = ref(false)
const actionNotice = ref(null)

const formatDateTime = value => {
    if (!value) return '暂无记录'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const getStatusLabel = status => {
    if (status === 'synced') return '已同步'
    if (status === 'failed') return '同步失败'
    if (status === 'manual_seed') return '临时种子'
    if (status) return status
    return '未知'
}

const getStatusSeverity = status => {
    if (status === 'synced') return 'success'
    if (status === 'failed') return 'danger'
    if (status === 'manual_seed') return 'warning'
    return 'secondary'
}

const teacherCountText = computed(() => `${teachers.value.length} 位`)
const lastSyncedText = computed(() => formatDateTime(meta.value.last_synced_at))
const primarySourceText = computed(() => meta.value.source_url || '未配置主源站')
const statusText = computed(() => getStatusLabel(meta.value.source_status))

const getAreaPreview = teacher => {
    const areas = teacher.research_areas || []

    if (areas.length <= 5) return areas

    return [...areas.slice(0, 5), `+${areas.length - 5}`]
}

const getProfileLinks = teacher =>
    (teacher.homepage_urls || []).filter(link => link.type === 'profile')

const notify = (type, message) => {
    if (!window.notyf) return

    if (type === 'success') {
        window.notyf.success(message)
        return
    }

    if (type === 'error') {
        window.notyf.error(message)
        return
    }

    window.notyf.open({ type, message })
}

const loadMentors = async ({ silent = false } = {}) => {
    if (!silent) {
        loading.value = true
    }

    try {
        const response = await axios.get('/teachers/list')
        teachers.value = response.data.items || []
        meta.value = {
            ...DEFAULT_META,
            ...(response.data.meta || {}),
        }

        if (!silent) {
            actionNotice.value = null
        }
    } catch (error) {
        console.error('加载教师缓存失败:', error)
        actionNotice.value = {
            type: 'error',
            title: '缓存状态读取失败',
            message: '暂时无法读取教师介绍缓存，请稍后重试。',
        }
    } finally {
        loading.value = false
    }
}

const refreshMentors = async () => {
    await loadMentors()

    if (!actionNotice.value) {
        notify('success', '教师缓存状态已刷新')
    }
}

const confirmSync = () => {
    confirm.require({
        group: 'mentor-sync',
        modal: true,
        header: '从源站同步教师资料',
        message: '确认访问学院教师队伍页和已配置个人主页，并把结果写入本站教师缓存？同步失败时会继续使用旧缓存。',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: '取消',
            severity: 'secondary',
            outlined: true,
        },
        acceptProps: {
            label: '开始同步',
            severity: 'primary',
        },
        accept: syncMentors,
    })
}

const syncMentors = async () => {
    syncing.value = true
    actionNotice.value = {
        type: 'info',
        title: '正在访问源站',
        message: '同步过程中请保持页面打开，完成后会自动刷新缓存状态。',
    }

    try {
        const response = await axios.post('/teachers/sync')
        teachers.value = response.data.items || []
        meta.value = {
            ...DEFAULT_META,
            ...(response.data.meta || {}),
        }

        if (response.data.ok) {
            actionNotice.value = {
                type: 'success',
                title: '同步完成',
                message: '教师资料已写入新缓存，公开页会读取最新缓存。',
            }
            notify('success', '教师资料同步完成')
        } else {
            actionNotice.value = {
                type: 'error',
                title: '同步失败',
                message: '未写入新缓存，公开页继续使用最近一次成功缓存。',
            }
            notify('error', '教师资料同步失败，已保留旧缓存')
        }
    } catch (error) {
        console.error('同步教师资料失败:', error)
        const forbidden = error.response?.status === 403
        actionNotice.value = {
            type: 'error',
            title: forbidden ? '无权执行同步' : '同步请求失败',
            message: forbidden
                ? '当前角色无权执行该操作。'
                : '同步请求未完成，公开页继续使用旧缓存。',
        }
    } finally {
        syncing.value = false
    }
}

onMounted(() => {
    loadMentors()
})
</script>

<template>
    <div class="admin-mentors-page">
        <ConfirmDialog group="mentor-sync" />

        <header class="admin-mentors-header">
            <div>
                <p class="admin-mentors-eyebrow">Data Management</p>
                <h1>教师介绍管理</h1>
                <p>
                    查看当前公开页读取的四位教师缓存数据，并按权限从源站手动同步。
                </p>
            </div>

            <div class="admin-mentors-actions">
                <Button
                    label="刷新缓存状态"
                    icon="pi pi-refresh"
                    severity="secondary"
                    outlined
                    :loading="loading && !syncing"
                    :disabled="syncing"
                    @click="refreshMentors"
                />
                <Button
                    label="从源站同步教师资料"
                    icon="pi pi-sync"
                    :loading="syncing"
                    :disabled="loading"
                    @click="confirmSync"
                />
            </div>
        </header>

        <section
            v-if="actionNotice"
            class="admin-mentors-notice"
            :class="`admin-mentors-notice--${actionNotice.type}`"
            role="status"
        >
            <i
                :class="{
                    'pi pi-info-circle': actionNotice.type === 'info',
                    'pi pi-check-circle': actionNotice.type === 'success',
                    'pi pi-exclamation-circle': actionNotice.type === 'error',
                }"
                aria-hidden="true"
            ></i>
            <div>
                <strong>{{ actionNotice.title }}</strong>
                <p>{{ actionNotice.message }}</p>
            </div>
        </section>

        <section class="admin-mentors-stats" aria-label="教师缓存状态">
            <article class="admin-mentors-stat">
                <span>教师数量</span>
                <strong>{{ teacherCountText }}</strong>
            </article>
            <article class="admin-mentors-stat">
                <span>缓存状态</span>
                <strong>{{ statusText }}</strong>
            </article>
            <article class="admin-mentors-stat">
                <span>最近同步</span>
                <strong>{{ lastSyncedText }}</strong>
            </article>
            <article class="admin-mentors-stat admin-mentors-stat--source">
                <span>主源站</span>
                <a
                    v-if="meta.source_url"
                    :href="meta.source_url"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {{ primarySourceText }}
                </a>
                <strong v-else>{{ primarySourceText }}</strong>
            </article>
        </section>

        <section v-if="meta.sync_note" class="admin-mentors-meta-note">
            <i class="pi pi-database" aria-hidden="true"></i>
            <span>{{ meta.sync_note }}</span>
        </section>

        <section class="admin-mentors-table-panel" aria-label="教师缓存数据">
            <DataTable
                :value="teachers"
                :loading="loading"
                dataKey="id"
                responsiveLayout="scroll"
                class="admin-mentors-table"
            >
                <Column field="name" header="教师">
                    <template #body="{ data }">
                        <div class="admin-mentor-teacher">
                            <img
                                v-if="data.avatar_url"
                                :src="data.avatar_url"
                                :alt="`${data.name}头像`"
                            />
                            <span v-else class="admin-mentor-avatar-fallback">
                                {{ data.name.slice(0, 1) }}
                            </span>
                            <div>
                                <strong>{{ data.name }}</strong>
                                <span>{{ data.id }}</span>
                            </div>
                        </div>
                    </template>
                </Column>

                <Column header="职称 / 单位">
                    <template #body="{ data }">
                        <div class="admin-mentor-text-stack">
                            <strong>{{ data.title || '职称待补充' }}</strong>
                            <span>{{ data.affiliation || '单位待补充' }}</span>
                        </div>
                    </template>
                </Column>

                <Column header="研究方向">
                    <template #body="{ data }">
                        <div class="admin-mentor-tags">
                            <Tag
                                v-for="area in getAreaPreview(data)"
                                :key="area"
                                :value="area"
                                severity="info"
                            />
                            <span
                                v-if="!data.research_areas || data.research_areas.length === 0"
                                class="admin-mentor-muted"
                            >
                                待补充
                            </span>
                        </div>
                    </template>
                </Column>

                <Column field="email" header="邮箱">
                    <template #body="{ data }">
                        <a v-if="data.email" :href="`mailto:${data.email}`">
                            {{ data.email }}
                        </a>
                        <span v-else class="admin-mentor-muted">未配置</span>
                    </template>
                </Column>

                <Column header="同步状态">
                    <template #body="{ data }">
                        <div class="admin-mentor-text-stack">
                            <Tag
                                :value="getStatusLabel(data.source_status)"
                                :severity="getStatusSeverity(data.source_status)"
                            />
                            <span>{{ formatDateTime(data.last_synced_at) }}</span>
                        </div>
                    </template>
                </Column>

                <Column header="主来源">
                    <template #body="{ data }">
                        <a
                            v-if="data.source_url"
                            :href="data.source_url"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            打开来源
                        </a>
                        <span v-else class="admin-mentor-muted">未配置</span>
                    </template>
                </Column>

                <Column header="同步备注">
                    <template #body="{ data }">
                        <div class="admin-mentor-note">
                            {{ data.sync_note || '无' }}
                        </div>
                    </template>
                </Column>

                <Column header="公开页">
                    <template #body="{ data }">
                        <router-link
                            class="admin-mentor-preview"
                            :to="{ name: 'mentor_detail', params: { id: data.id } }"
                        >
                            预览
                        </router-link>
                    </template>
                </Column>
            </DataTable>
        </section>

        <section class="admin-mentors-source-panel" aria-label="教师源站列表">
            <div class="admin-mentors-source-header">
                <h2>已配置源站</h2>
                <p>学院教师队伍页为主源；个人主页仅作为白名单教师的补充源。</p>
            </div>

            <div class="admin-mentors-source-grid">
                <article
                    v-for="teacher in teachers"
                    :key="teacher.id"
                    class="admin-mentors-source-card"
                >
                    <div>
                        <strong>{{ teacher.name }}</strong>
                        <span>{{ teacher.source_url ? '主来源已配置' : '主来源未配置' }}</span>
                    </div>
                    <a
                        v-if="teacher.source_url"
                        :href="teacher.source_url"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        主来源
                    </a>
                    <span v-else class="admin-mentor-muted">主来源未配置</span>
                    <div class="admin-mentors-source-profiles">
                        <template v-if="getProfileLinks(teacher).length > 0">
                            <a
                                v-for="link in getProfileLinks(teacher)"
                                :key="link.url"
                                :href="link.url"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {{ link.label || '个人主页' }}
                            </a>
                        </template>
                        <span v-else>个人主页未配置</span>
                    </div>
                </article>
            </div>
        </section>
    </div>
</template>

<style scoped>
.admin-mentors-page {
    width: min(100%, 1480px);
    margin: 0 auto;
    color: var(--text-primary);
}

.admin-mentors-header {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 22px;
}

.admin-mentors-eyebrow {
    margin: 0 0 8px;
    color: var(--accent-color);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0;
}

.admin-mentors-header h1 {
    margin: 0;
    font-size: 2rem;
    line-height: 1.25;
    letter-spacing: 0;
}

.admin-mentors-header p {
    max-width: 680px;
    margin: 10px 0 0;
    color: var(--text-secondary);
    line-height: 1.7;
}

.admin-mentors-actions {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.admin-mentors-notice {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 18px;
    padding: 14px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-surface);
}

.admin-mentors-notice i {
    margin-top: 3px;
    color: var(--accent-color);
}

.admin-mentors-notice strong {
    display: block;
    font-size: 0.95rem;
}

.admin-mentors-notice p {
    margin: 3px 0 0;
    color: var(--text-secondary);
    line-height: 1.55;
}

.admin-mentors-notice--success {
    border-color: rgba(16, 185, 129, 0.24);
}

.admin-mentors-notice--success i {
    color: #10b981;
}

.admin-mentors-notice--error {
    border-color: rgba(239, 68, 68, 0.26);
}

.admin-mentors-notice--error i {
    color: #ef4444;
}

.admin-mentors-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 18px;
}

.admin-mentors-stat {
    min-height: 104px;
    padding: 18px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-surface);
}

.admin-mentors-stat span {
    display: block;
    margin-bottom: 8px;
    color: var(--text-secondary);
    font-size: 0.82rem;
}

.admin-mentors-stat strong,
.admin-mentors-stat a {
    color: var(--text-primary);
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1.55;
    overflow-wrap: anywhere;
}

.admin-mentors-stat a:hover {
    color: var(--accent-color);
}

.admin-mentors-stat--source {
    grid-column: span 1;
}

.admin-mentors-meta-note,
.admin-mentors-table-panel,
.admin-mentors-source-panel {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-surface);
}

.admin-mentors-meta-note {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-bottom: 18px;
    padding: 14px 16px;
    color: var(--text-secondary);
    line-height: 1.6;
}

.admin-mentors-meta-note i {
    margin-top: 4px;
    color: var(--accent-color);
}

.admin-mentors-table-panel {
    overflow: hidden;
    margin-bottom: 18px;
}

.admin-mentor-teacher {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 150px;
}

.admin-mentor-teacher img,
.admin-mentor-avatar-fallback {
    width: 48px;
    height: 60px;
    flex: 0 0 auto;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-secondary);
    object-fit: cover;
}

.admin-mentor-avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-color);
    font-size: 1.2rem;
    font-weight: 700;
}

.admin-mentor-teacher strong,
.admin-mentor-text-stack strong {
    display: block;
    color: var(--text-primary);
    line-height: 1.4;
}

.admin-mentor-teacher span,
.admin-mentor-text-stack span,
.admin-mentor-muted {
    display: block;
    color: var(--text-secondary);
    font-size: 0.84rem;
    line-height: 1.45;
}

.admin-mentor-text-stack {
    min-width: 180px;
    display: grid;
    gap: 6px;
}

.admin-mentor-tags {
    min-width: 220px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.admin-mentor-note {
    min-width: 220px;
    max-width: 300px;
    color: var(--text-secondary);
    font-size: 0.86rem;
    line-height: 1.55;
}

.admin-mentor-preview {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    padding: 6px 10px;
    border: 1px solid rgba(102, 126, 234, 0.22);
    border-radius: 6px;
    color: var(--accent-color);
    font-size: 0.86rem;
    font-weight: 650;
    text-decoration: none;
}

.admin-mentor-preview:hover {
    border-color: rgba(102, 126, 234, 0.36);
    background: rgba(102, 126, 234, 0.08);
}

.admin-mentors-source-panel {
    padding: 20px;
}

.admin-mentors-source-header {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 16px;
}

.admin-mentors-source-header h2 {
    margin: 0;
    font-size: 1.15rem;
    letter-spacing: 0;
}

.admin-mentors-source-header p {
    max-width: 560px;
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.6;
}

.admin-mentors-source-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.admin-mentors-source-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px 14px;
    padding: 14px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
}

.admin-mentors-source-card strong {
    display: block;
    line-height: 1.4;
}

.admin-mentors-source-card span,
.admin-mentors-source-profiles {
    color: var(--text-secondary);
    font-size: 0.84rem;
    line-height: 1.5;
}

.admin-mentors-source-profiles {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.admin-mentors-source-card a,
.admin-mentors-source-profiles a {
    overflow-wrap: anywhere;
}

::v-deep(.admin-mentors-table .p-datatable-thead > tr > th) {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

::v-deep(.admin-mentors-table .p-datatable-tbody > tr),
::v-deep(.admin-mentors-table .p-datatable-tbody > tr > td) {
    background: var(--bg-surface);
    color: var(--text-primary);
}

::v-deep(.admin-mentors-table .p-datatable-tbody > tr > td),
::v-deep(.admin-mentors-table .p-datatable-thead > tr > th) {
    border-color: var(--border-color);
}

@media (max-width: 1180px) {
    .admin-mentors-stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .admin-mentors-header {
        flex-direction: column;
    }

    .admin-mentors-actions {
        justify-content: flex-start;
    }
}

@media (max-width: 760px) {
    .admin-mentors-page {
        width: 100%;
    }

    .admin-mentors-stats,
    .admin-mentors-source-grid {
        grid-template-columns: 1fr;
    }

    .admin-mentors-source-header {
        flex-direction: column;
    }
}
</style>
