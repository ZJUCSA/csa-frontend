<!--
职责范围：提供后台 `/admin/mentors` 教师介绍管理页，用于维护教师公开资料、来源配置和待审核同步建议。
功能边界：本页面不直接解析远程主页、不展示服务器内部异常，也不绕过后端权限和审核发布流程。
-->

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { useConfirm } from 'primevue/useconfirm'

const EMPTY_FORM = {
    id: '',
    enabled: true,
    sort_order: 1,
    name: '',
    title: '',
    affiliation: '',
    email: '',
    avatar_url: '',
    research_areas_text: '',
    summary: '',
    bio: '',
    standard_homepage_url: '',
    links: [],
}

const MANUAL_FIELDS = [
    'name',
    'title',
    'affiliation',
    'research_areas',
    'summary',
    'bio',
    'email',
    'avatar_url',
]

const axios = inject('axios')
const confirm = useConfirm()

const records = ref([])
const meta = ref({})
const loading = ref(false)
const saving = ref(false)
const syncingId = ref('')
const editorVisible = ref(false)
const reviewVisible = ref(false)
const editingRecord = ref(null)
const reviewRecord = ref(null)
const selectedFields = ref([])
const form = ref({ ...EMPTY_FORM })
const failedAvatarIds = ref(new Set())

const sortedRecords = computed(() => records.value)
const hasPendingDrafts = computed(() =>
    records.value.some(record => record.draft?.status === 'pending')
)

const formatDateTime = value => {
    if (!value) return '暂无记录'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const notify = (type, message) => {
    if (!window.notyf) return

    if (type === 'success') {
        window.notyf.success(message)
    } else {
        window.notyf.error(message)
    }
}

const cleanText = value => String(value || '').trim()

const isHttpUrl = value => {
    try {
        const parsedUrl = new URL(value)
        return ['http:', 'https:'].includes(parsedUrl.protocol) && Boolean(parsedUrl.hostname)
    } catch {
        return false
    }
}

const isAvatarUrl = value => {
    const cleanedValue = cleanText(value)
    if (!cleanedValue) return true

    if (cleanedValue.startsWith('/')) {
        return !/\s/.test(cleanedValue)
    }

    return isHttpUrl(cleanedValue)
}

const isValidEmail = value => !cleanText(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(value))
const isStandardHomepageUrl = value =>
    !cleanText(value) || /^https?:\/\/person\.zju\.edu\.cn\/[^/?#]+\/?$/.test(cleanText(value))

const normalizeLinkUrl = value => cleanText(value).replace(/\/+$/, '')

const findDuplicateLinkUrl = links => {
    const seenUrls = new Set()

    for (const link of links) {
        const url = cleanText(link.url)
        if (!url) continue

        const normalizedUrl = normalizeLinkUrl(url)
        if (seenUrls.has(normalizedUrl)) {
            return url
        }

        seenUrls.add(normalizedUrl)
    }

    return ''
}

const validateForm = () => {
    if (!cleanText(form.value.name)) {
        return '请先填写教师姓名'
    }

    const sortOrder = Number(form.value.sort_order)
    if (!Number.isInteger(sortOrder) || sortOrder < 1) {
        return '排序值必须是大于 0 的整数'
    }

    const sortConflict = records.value.find(
        record =>
            record.id !== editingRecord.value?.id &&
            Number(record.sort_order) === sortOrder
    )
    if (sortConflict) {
        return `排序值已被「${sortConflict.published.name}」使用，请调整排序`
    }

    if (!isValidEmail(form.value.email)) {
        return '邮箱格式不正确，请填写形如 name@example.com 的公开邮箱'
    }

    if (!isAvatarUrl(form.value.avatar_url)) {
        return '头像 URL 必须是 http(s) 地址，或以 / 开头的站内资源路径'
    }

    if (!isStandardHomepageUrl(form.value.standard_homepage_url)) {
        return '标准浙大个人主页 URL 必须形如 https://person.zju.edu.cn/<slug>'
    }

    for (const link of form.value.links) {
        const url = cleanText(link.url)
        if (url && !isHttpUrl(url)) {
            return `外部链接 URL 格式不正确：${url}`
        }
    }

    const duplicateUrl = findDuplicateLinkUrl(form.value.links)
    if (duplicateUrl) {
        return `外部链接重复：${duplicateUrl}`
    }

    return ''
}

const getApiErrorMessage = (error, fallback) => {
    const detail = error?.response?.data?.detail

    if (typeof detail === 'string') {
        return detail
    }

    if (Array.isArray(detail) && detail.length > 0) {
        return detail.map(item => item.msg || item.message || String(item)).join('；')
    }

    return fallback
}

const shouldShowRecordAvatar = record =>
    Boolean(record.published?.avatar_url) && !failedAvatarIds.value.has(record.id)

const markRecordAvatarFailed = id => {
    const nextFailedIds = new Set(failedAvatarIds.value)
    nextFailedIds.add(id)
    failedAvatarIds.value = nextFailedIds
}

const fetchRecords = async () => {
    loading.value = true

    try {
        const response = await axios.get('/teachers/admin/list')
        records.value = response.data.items || []
        meta.value = response.data.meta || {}
    } catch (error) {
        console.error('读取教师管理数据失败:', error)
        notify('error', '教师管理数据读取失败')
    } finally {
        loading.value = false
    }
}

const openCreate = () => {
    editingRecord.value = null
    form.value = {
        ...EMPTY_FORM,
        sort_order: records.value.length + 1,
        links: [],
    }
    editorVisible.value = true
}

const openEdit = record => {
    editingRecord.value = record
    form.value = {
        id: record.id,
        enabled: record.enabled,
        sort_order: record.sort_order,
        name: record.published.name,
        title: record.published.title,
        affiliation: record.published.affiliation,
        email: record.published.email,
        avatar_url: record.published.avatar_url,
        research_areas_text: (record.published.research_areas || []).join('\n'),
        summary: record.published.summary,
        bio: record.published.bio,
        standard_homepage_url: record.source_config?.standard_homepage_url || '',
        links: (record.source_config?.external_links || []).map(link => ({ ...link })),
    }
    editorVisible.value = true
}

const saveRecord = async () => {
    const validationMessage = validateForm()
    if (validationMessage) {
        notify('error', validationMessage)
        return
    }

    saving.value = true

    try {
        const payload = buildSavePayload()
        const response = await axios.post('/teachers/admin/save', payload)
        records.value = response.data.items || []
        meta.value = response.data.meta || {}
        editorVisible.value = false
        notify('success', '教师资料已保存')
    } catch (error) {
        console.error('保存教师资料失败:', error)
        notify('error', getApiErrorMessage(error, '教师资料保存失败'))
    } finally {
        saving.value = false
    }
}

const buildSavePayload = () => {
    const cleanedLinks = form.value.links
        .map(link => ({
            label: cleanText(link.label),
            url: cleanText(link.url),
            type: cleanText(link.type || 'profile') || 'profile',
        }))
        .filter(link => link.url)
    const fieldSources = {
        ...(editingRecord.value?.field_sources || {}),
    }

    for (const field of MANUAL_FIELDS) {
        fieldSources[field] = 'manual'
    }

    const teacherId = cleanText(form.value.id)
    const standardHomepageUrl = cleanText(form.value.standard_homepage_url)

    return {
        id: teacherId,
        enabled: form.value.enabled,
        sort_order: Number(form.value.sort_order) || records.value.length + 1,
        published: {
            id: teacherId,
            name: cleanText(form.value.name),
            title: cleanText(form.value.title),
            affiliation: cleanText(form.value.affiliation),
            email: cleanText(form.value.email),
            avatar_url: cleanText(form.value.avatar_url),
            research_areas: parseResearchAreas(form.value.research_areas_text),
            summary: cleanText(form.value.summary),
            bio: cleanText(form.value.bio),
            homepage_urls: cleanedLinks,
            source_url: standardHomepageUrl || cleanedLinks[0]?.url || '',
            source_status: 'published',
            last_synced_at: editingRecord.value?.published?.last_synced_at || '',
            sync_note: editingRecord.value?.published?.sync_note || '',
            profile_sections: editingRecord.value?.published?.profile_sections || [],
        },
        source_config: {
            standard_homepage_url: standardHomepageUrl,
            external_links: cleanedLinks,
        },
        field_sources: fieldSources,
    }
}

const parseResearchAreas = value =>
    String(value || '')
        .split(/\n|[、，,;；]/)
        .map(item => item.trim())
        .filter(Boolean)

const addLink = () => {
    form.value.links.push({
        label: '',
        url: '',
        type: 'profile',
    })
}

const removeLink = index => {
    form.value.links.splice(index, 1)
}

const confirmDelete = record => {
    confirm.require({
        group: 'mentor-admin-actions',
        modal: true,
        header: '删除教师资料',
        message: `确认删除「${record.published.name}」？删除后前台不再展示该教师。`,
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: '取消',
            severity: 'secondary',
            outlined: true,
        },
        acceptProps: {
            label: '删除',
            severity: 'danger',
        },
        accept: () => deleteRecord(record),
    })
}

const deleteRecord = async record => {
    try {
        await axios.delete(`/teachers/admin/${record.id}`)
        await fetchRecords()
        notify('success', '教师资料已删除')
    } catch (error) {
        console.error('删除教师资料失败:', error)
        notify('error', '教师资料删除失败')
    }
}

const confirmSync = record => {
    confirm.require({
        group: 'mentor-admin-actions',
        modal: true,
        header: record ? '同步单个教师' : '同步全部教师',
        message: record
            ? `确认读取「${record.published.name}」的标准浙大个人主页？同步结果只会进入待审核变更，不会直接发布。`
            : '确认读取所有已配置的标准浙大个人主页？同步结果只会进入待审核变更，不会直接发布。',
        icon: 'pi pi-info-circle',
        rejectProps: {
            label: '取消',
            severity: 'secondary',
            outlined: true,
        },
        acceptProps: {
            label: '开始同步',
            severity: 'primary',
        },
        accept: () => syncRecords(record),
    })
}

const syncRecords = async record => {
    syncingId.value = record?.id || '__all__'

    try {
        const response = await axios.post('/teachers/admin/sync', {
            id: record?.id || '',
        })
        records.value = response.data.items || []
        meta.value = response.data.meta || {}
        notify('success', '同步完成，请查看待审核变更')
    } catch (error) {
        console.error('同步教师资料失败:', error)
        notify('error', '同步请求失败')
    } finally {
        syncingId.value = ''
    }
}

const openReview = record => {
    reviewRecord.value = record
    selectedFields.value = (record.draft?.changes || []).map(change => change.field)
    reviewVisible.value = true
}

const toggleSelectedField = field => {
    if (selectedFields.value.includes(field)) {
        selectedFields.value = selectedFields.value.filter(item => item !== field)
    } else {
        selectedFields.value = [...selectedFields.value, field]
    }
}

const publishDraft = async () => {
    if (!reviewRecord.value || selectedFields.value.length === 0) {
        notify('error', '请至少选择一项变更')
        return
    }

    try {
        const response = await axios.post('/teachers/admin/publish', {
            id: reviewRecord.value.id,
            fields: selectedFields.value,
        })
        records.value = response.data.items || []
        meta.value = response.data.meta || {}
        reviewVisible.value = false
        notify('success', '同步建议已发布')
    } catch (error) {
        console.error('发布同步建议失败:', error)
        notify('error', '同步建议发布失败')
    }
}

const discardDraft = async record => {
    try {
        const response = await axios.post('/teachers/admin/discard', {
            id: record.id,
        })
        records.value = response.data.items || []
        meta.value = response.data.meta || {}
        reviewVisible.value = false
        notify('success', '同步建议已忽略')
    } catch (error) {
        console.error('忽略同步建议失败:', error)
        notify('error', '同步建议忽略失败')
    }
}

const getDraftLabel = status => {
    const labels = {
        idle: '未同步',
        pending: '待审核',
        no_change: '无变化',
        no_source: '人工维护',
        unsupported: '人工维护',
        failed: '读取失败',
        applied: '已发布',
        ignored: '已忽略',
    }
    return labels[status] || '未知'
}

const getDraftSeverity = status => {
    if (status === 'pending') return 'warning'
    if (status === 'failed') return 'danger'
    if (['no_source', 'unsupported'].includes(status)) return 'secondary'
    if (['no_change', 'applied'].includes(status)) return 'success'
    return 'info'
}

const getSourceLabel = record => {
    if (record.source_config?.standard_homepage_url) {
        return '标准主页'
    }

    return '人工维护'
}

const formatValue = value => {
    if (Array.isArray(value)) {
        return value.length ? value.join('、') : '空'
    }

    return value || '空'
}

onMounted(() => {
    fetchRecords()
})
</script>

<template>
    <ConfirmDialog group="mentor-admin-actions" />

    <div class="main-part-lg mx-auto admin-mentors-page">
        <div class="text-3xl font-bold mb-6">教师介绍管理</div>

        <div class="mentor-toolbar mb-4">
            <Button
                label="新增教师"
                icon="pi pi-plus"
                class="mentor-toolbar-btn mentor-toolbar-btn--primary"
                @click="openCreate"
            />
            <Button
                label="同步全部"
                icon="pi pi-sync"
                class="mentor-toolbar-btn"
                :loading="syncingId === '__all__'"
                @click="confirmSync(null)"
            />
            <Button
                label="刷新"
                icon="pi pi-refresh"
                severity="secondary"
                outlined
                :loading="loading"
                @click="fetchRecords"
            />
        </div>

        <div v-if="meta.sync_note || hasPendingDrafts" class="mentor-admin-note mb-4">
            <i class="pi pi-info-circle" aria-hidden="true"></i>
            <span>
                {{ meta.sync_note || '存在待审核同步变更，请进入对应教师的审核入口确认后再发布。' }}
            </span>
        </div>

        <div class="overflow-x-auto mb-4 table-scroll-wrap">
            <DataTable
                :value="sortedRecords"
                :loading="loading"
                dataKey="id"
                class="min-w-full"
            >
                <Column field="sort_order" header="排序">
                    <template #body="{ data }">
                        <div class="mentor-order-cell">{{ data.sort_order }}</div>
                    </template>
                </Column>

                <Column header="状态">
                    <template #body="{ data }">
                        <div class="mentor-status-cell">
                            <Tag
                                :value="data.enabled ? '公开' : '停用'"
                                :severity="data.enabled ? 'success' : 'secondary'"
                            />
                            <Tag
                                :value="getDraftLabel(data.draft?.status)"
                                :severity="getDraftSeverity(data.draft?.status)"
                            />
                        </div>
                    </template>
                </Column>

                <Column header="教师">
                    <template #body="{ data }">
                        <div class="mentor-teacher-cell">
                            <img
                                v-if="shouldShowRecordAvatar(data)"
                                :src="data.published.avatar_url"
                                :alt="`${data.published.name}头像`"
                                @error="markRecordAvatarFailed(data.id)"
                            />
                            <div v-else class="mentor-avatar-fallback">
                                {{ data.published.name.slice(0, 1) || '?' }}
                            </div>
                            <div>
                                <strong>{{ data.published.name || '未命名教师' }}</strong>
                                <span>{{ data.published.title || '职称待补充' }}</span>
                                <small>{{ data.published.affiliation || '单位待补充' }}</small>
                            </div>
                        </div>
                    </template>
                </Column>

                <Column header="标准主页">
                    <template #body="{ data }">
                        <div class="mentor-source-cell">
                            <Tag :value="getSourceLabel(data)" severity="info" />
                            <a
                                v-if="data.source_config?.standard_homepage_url"
                                :href="data.source_config.standard_homepage_url"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                打开主页
                            </a>
                            <span v-else>未配置自动同步来源</span>
                        </div>
                    </template>
                </Column>

                <Column header="待审核变更">
                    <template #body="{ data }">
                        <div class="mentor-draft-cell">
                            <strong>{{ data.draft?.changes?.length || 0 }} 项</strong>
                            <span>{{ data.draft?.message || '暂无同步建议。' }}</span>
                            <small v-if="data.draft?.fetched_at">
                                {{ formatDateTime(data.draft.fetched_at) }}
                            </small>
                        </div>
                    </template>
                </Column>

                <Column header="操作">
                    <template #body="{ data }">
                        <div class="mentor-actions-cell">
                            <Button
                                label="编辑"
                                size="small"
                                class="mentor-table-action mentor-table-action--edit"
                                @click="openEdit(data)"
                            />
                            <Button
                                label="同步"
                                size="small"
                                severity="secondary"
                                outlined
                                :loading="syncingId === data.id"
                                @click="confirmSync(data)"
                            />
                            <Button
                                label="审核"
                                size="small"
                                severity="warning"
                                :disabled="data.draft?.status !== 'pending'"
                                @click="openReview(data)"
                            />
                            <router-link
                                v-if="data.enabled"
                                class="mentor-preview-link"
                                :to="{ name: 'mentor_detail', params: { id: data.id } }"
                            >
                                预览
                            </router-link>
                            <span v-else class="mentor-preview-link mentor-preview-link--disabled">
                                未公开
                            </span>
                            <Button
                                label="删除"
                                size="small"
                                severity="danger"
                                outlined
                                @click="confirmDelete(data)"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog
            v-model:visible="editorVisible"
            modal
            :header="editingRecord ? '编辑教师资料' : '新增教师'"
            class="mentor-editor-dialog"
        >
            <div class="mentor-editor-grid">
                <label>
                    <span>教师 ID</span>
                    <input
                        v-model="form.id"
                        class="mentor-input"
                        :disabled="Boolean(editingRecord)"
                        placeholder="留空则自动生成"
                    />
                </label>
                <label>
                    <span>排序</span>
                    <input v-model="form.sort_order" class="mentor-input" type="number" min="1" />
                </label>
                <label class="mentor-checkbox-row">
                    <input v-model="form.enabled" type="checkbox" />
                    <span>在前台公开展示</span>
                </label>
                <label>
                    <span>姓名</span>
                    <input v-model="form.name" class="mentor-input" />
                </label>
                <label>
                    <span>职称</span>
                    <input v-model="form.title" class="mentor-input" />
                </label>
                <label>
                    <span>所属单位</span>
                    <input v-model="form.affiliation" class="mentor-input" />
                </label>
                <label>
                    <span>邮箱</span>
                    <input v-model="form.email" class="mentor-input" type="email" />
                </label>
                <label>
                    <span>头像 URL</span>
                    <input v-model="form.avatar_url" class="mentor-input" type="url" />
                    <small>请填写已上传到图床的公开图片 URL。</small>
                </label>
                <label class="mentor-editor-wide">
                    <span>研究方向</span>
                    <textarea
                        v-model="form.research_areas_text"
                        class="mentor-textarea"
                        rows="4"
                        placeholder="每行一个方向，也支持顿号或逗号分隔"
                    ></textarea>
                </label>
                <label class="mentor-editor-wide">
                    <span>一句话简介</span>
                    <textarea v-model="form.summary" class="mentor-textarea" rows="3"></textarea>
                </label>
                <label class="mentor-editor-wide">
                    <span>详细简介</span>
                    <textarea v-model="form.bio" class="mentor-textarea" rows="4"></textarea>
                </label>
                <label class="mentor-editor-wide">
                    <span>标准浙大个人主页 URL</span>
                    <input
                        v-model="form.standard_homepage_url"
                        class="mentor-input"
                        type="url"
                        placeholder="例如 https://person.zju.edu.cn/flin"
                    />
                    <small>只有标准浙大个人主页会参与自动同步；其他主页请放在外部链接中。</small>
                </label>
            </div>

            <div class="mentor-link-editor">
                <div class="mentor-link-editor__header">
                    <strong>外部链接</strong>
                    <Button label="添加链接" size="small" icon="pi pi-plus" @click="addLink" />
                </div>
                <div
                    v-for="(link, index) in form.links"
                    :key="index"
                    class="mentor-link-row"
                >
                    <input v-model="link.label" class="mentor-input" placeholder="名称" />
                    <input v-model="link.url" class="mentor-input" type="url" placeholder="URL" />
                    <input v-model="link.type" class="mentor-input" placeholder="类型" />
                    <Button
                        icon="pi pi-trash"
                        severity="danger"
                        text
                        rounded
                        aria-label="删除链接"
                        @click="removeLink(index)"
                    />
                </div>
                <p v-if="form.links.length === 0" class="mentor-empty-hint">
                    暂无外部链接。
                </p>
            </div>

            <template #footer>
                <Button label="取消" severity="secondary" outlined @click="editorVisible = false" />
                <Button label="保存" :loading="saving" @click="saveRecord" />
            </template>
        </Dialog>

        <Dialog
            v-model:visible="reviewVisible"
            modal
            header="审核同步建议"
            class="mentor-review-dialog"
        >
            <div v-if="reviewRecord" class="mentor-review-content">
                <p class="mentor-review-summary">
                    同步建议来自
                    <a
                        v-if="reviewRecord.draft?.source_url"
                        :href="reviewRecord.draft.source_url"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        标准浙大个人主页
                    </a>
                    <span v-else>标准浙大个人主页</span>
                    ，请确认后再发布到前台。
                </p>

                <div
                    v-for="change in reviewRecord.draft?.changes || []"
                    :key="change.field"
                    class="mentor-review-change"
                >
                    <label class="mentor-checkbox-row">
                        <input
                            type="checkbox"
                            :checked="selectedFields.includes(change.field)"
                            @change="toggleSelectedField(change.field)"
                        />
                        <strong>{{ change.label || change.field }}</strong>
                    </label>
                    <div class="mentor-review-diff">
                        <div>
                            <span>当前公开值</span>
                            <p>{{ formatValue(change.current) }}</p>
                        </div>
                        <div>
                            <span>同步建议值</span>
                            <p>{{ formatValue(change.proposed) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button
                    label="忽略建议"
                    severity="secondary"
                    outlined
                    @click="discardDraft(reviewRecord)"
                />
                <Button label="发布选中项" @click="publishDraft" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.admin-mentors-page {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.text-3xl {
    color: var(--text-primary);
    transition: color 0.3s ease;
}

.mentor-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
}

.mentor-toolbar-btn--primary {
    background: var(--gradient-primary) !important;
    border: none !important;
}

.mentor-admin-note {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 0.875rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-surface);
    color: var(--text-secondary);
}

.mentor-admin-note i {
    margin-top: 0.2rem;
    color: var(--accent-color);
}

.mentor-order-cell {
    min-width: 3rem;
    color: var(--text-primary);
    font-weight: 700;
}

.mentor-status-cell,
.mentor-actions-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
}

.mentor-teacher-cell {
    min-width: 18rem;
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

.mentor-teacher-cell img,
.mentor-avatar-fallback {
    width: 48px;
    height: 60px;
    flex: 0 0 auto;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-secondary);
    object-fit: cover;
}

.mentor-avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-color);
    font-weight: 700;
}

.mentor-teacher-cell strong,
.mentor-draft-cell strong {
    display: block;
    color: var(--text-primary);
    line-height: 1.4;
}

.mentor-teacher-cell span,
.mentor-teacher-cell small,
.mentor-source-cell span,
.mentor-draft-cell span,
.mentor-draft-cell small,
.mentor-empty-hint,
.mentor-editor-grid small {
    display: block;
    color: var(--text-secondary);
    font-size: 0.85rem;
    line-height: 1.5;
}

.mentor-source-cell,
.mentor-draft-cell {
    min-width: 12rem;
    display: grid;
    gap: 0.35rem;
}

.mentor-preview-link {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 0.35rem 0.6rem;
    border: 1px solid rgba(102, 126, 234, 0.22);
    border-radius: 6px;
    color: var(--accent-color);
    font-size: 0.85rem;
    font-weight: 650;
    text-decoration: none;
}

.mentor-preview-link:hover {
    background: rgba(102, 126, 234, 0.08);
}

.mentor-preview-link--disabled,
.mentor-preview-link--disabled:hover {
    cursor: default;
    border-color: var(--border-color);
    background: transparent;
    color: var(--text-secondary);
}

.mentor-editor-dialog {
    width: min(920px, calc(100vw - 32px));
}

.mentor-review-dialog {
    width: min(760px, calc(100vw - 32px));
}

.mentor-editor-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.mentor-editor-grid label,
.mentor-link-editor {
    display: grid;
    gap: 0.4rem;
}

.mentor-editor-grid label > span,
.mentor-link-editor__header strong {
    color: var(--text-primary);
    font-weight: 650;
}

.mentor-editor-wide {
    grid-column: 1 / -1;
}

.mentor-input,
.mentor-textarea {
    width: 100%;
    min-width: 0;
    padding: 0.7rem 0.8rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-surface);
    color: var(--text-primary);
    font: inherit;
}

.mentor-textarea {
    resize: vertical;
}

.mentor-input:focus,
.mentor-textarea:focus {
    outline: 2px solid rgba(102, 126, 234, 0.18);
    border-color: rgba(102, 126, 234, 0.42);
}

.mentor-checkbox-row {
    display: flex !important;
    grid-template-columns: none !important;
    flex-direction: row;
    gap: 0.5rem !important;
    align-items: center;
}

.mentor-checkbox-row input {
    width: 1rem;
    height: 1rem;
}

.mentor-link-editor {
    margin-top: 1.25rem;
}

.mentor-link-editor__header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
}

.mentor-link-row {
    display: grid;
    grid-template-columns: 1fr 2fr 0.8fr auto;
    gap: 0.5rem;
    align-items: center;
}

.mentor-review-summary {
    margin: 0 0 1rem;
    color: var(--text-secondary);
    line-height: 1.7;
}

.mentor-review-change {
    padding: 1rem 0;
    border-top: 1px solid var(--border-color);
}

.mentor-review-diff {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 0.75rem;
}

.mentor-review-diff div {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
}

.mentor-review-diff span {
    display: block;
    margin-bottom: 0.35rem;
    color: var(--text-secondary);
    font-size: 0.82rem;
}

.mentor-review-diff p {
    margin: 0;
    color: var(--text-primary);
    line-height: 1.6;
    overflow-wrap: anywhere;
}

@media (max-width: 780px) {
    .admin-mentors-page {
        padding: 1.25rem;
    }

    .mentor-editor-grid,
    .mentor-review-diff,
    .mentor-link-row {
        grid-template-columns: 1fr;
    }
}
</style>
