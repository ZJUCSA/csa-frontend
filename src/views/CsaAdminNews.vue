<script setup>
import { computed } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { newsCategory } from '@/const'
import { useUserStore } from '@/stores/user'

const confirm = useConfirm()
const axios = inject('axios')
const userStore = useUserStore()

// 检查是否为管理员（rid=7）
const isManager = computed(() => userStore.admin_role_id === 7)

const data = ref([])

const show = ref(false)
const page = ref(1)
const total = ref(0)
const size = ref(10)
const first = computed(() => Math.max(0, (page.value - 1) * size.value))

const operator = ref(null)

const fetchTotal = () => {
    return axios.get('/news/count').then(res => {
        total.value = res.data.count
    })
}

const refreshContent = () => {
    return fetchTotal().then(() => {
        const maxPage = Math.max(1, Math.ceil(total.value / size.value))

        if (page.value > maxPage) {
            page.value = maxPage
            return
        }

        return fetchContent()
    })
}

const handlePageChange = event => {
    page.value = event.page + 1
    size.value = event.rows
}

const ConfirmDelete = (event, nid) => {
    confirm.require({
        group: 'news-delete',
        target: event.currentTarget,
        message: '确认删除该信息？',
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
        accept: () => {
            axios
                .post('/delete/news', {
                    nid: nid,
                })
                .then(() => {
                    refreshContent()
                    window.notyf.success('删除成功')
                })
        },
    })
}

const ConfirmCleanup = () => {
    confirm.require({
        group: 'news-cleanup',
        modal: true,
        header: '清理废弃草稿',
        message: '确认清理所有24小时前的废弃草稿？此操作将删除旧草稿及其关联图片，且不可恢复。',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: '取消',
            severity: 'secondary',
            outlined: true,
            class: 'news-cleanup-cancel',
        },
        acceptProps: {
            label: '清理',
            severity: 'danger',
            class: 'news-cleanup-confirm',
        },
        accept: () => {
            axios
                .post('/admin/cleanup_drafts')
                .then(res => {
                    const d = res.data.details || {
                        news_deleted: 0,
                        events_deleted: 0
                    }
                    refreshContent()
                    window.notyf.success(`清理完成: 删除新闻草稿${d.news_deleted}条, 活动草稿${d.events_deleted}条`)
                })
        },
    })
}

const fetchContent = () => {
    return axios
        .get('/news/list', {
            params: {
                page: page.value,
                size: size.value,
            },
        })
        .then(res => {
            data.value = res.data
        })
}

refreshContent()

watch([page, size], () => {
    fetchContent()
})
</script>

<template>
    <csa-edit-news
        v-model:show="show"
        @finish="refreshContent"
        :nid="operator"
    ></csa-edit-news>
    <ConfirmPopup group="news-delete"></ConfirmPopup>
    <ConfirmDialog group="news-cleanup" class="news-cleanup-dialog"></ConfirmDialog>
    <div class="main-part-lg mx-auto admin-news-page">
        <div class="text-3xl font-bold mb-6">信息管理</div>
        <Button
            label="创建信息"
            class="mb-4 news-toolbar-btn news-toolbar-btn--primary"
            @click="
                () => {
                    show = true
                    operator = null
                }
            "
        ></Button>
        <Button
            v-if="isManager"
            label="清理废弃草稿"
            class="mb-4 ml-2 news-toolbar-btn news-toolbar-btn--warning"
            @click="ConfirmCleanup"
        ></Button>
        <DataTable :value="data" class="mb-4">
            <Column field="nid" header="编号"></Column>
            <Column field="title" header="标题">
                <template #body="{ data }">
                    <div class="min-w-48">{{ data.title }}</div>
                </template>
            </Column>
            <Column field="category" header="类型">
                <template #body="{ data }">
                    <div>{{ newsCategory[data.category] }}</div>
                </template>
            </Column>
            <Column field="tag" header="标签">
                <template #body="{ data }">
                    <div class="flex gap-1 news-tag-list" v-if="data.tag">
                        <div v-for="tag in data.tag.split(' ')" :key="tag">
                            <Tag :value="tag" class="text-nowrap news-tag-pill"></Tag>
                        </div>
                    </div>
                </template>
            </Column>
            <Column field="last_update" header="上次更新">
                <template #body="{ data }">
                    <div>
                        {{ new Date(data.last_update * 1000).toLocaleString() }}
                    </div>
                </template>
            </Column>
            <Column field="edit" header="编辑">
                <template #body="{ data }">
                    <div>
                        <Button
                            label="编辑"
                            size="small"
                            class="whitespace-nowrap news-table-action news-table-action--edit"
                            @click="
                                () => {
                                    operator = data.nid
                                    show = true
                                }
                            "
                        ></Button>
                    </div>
                </template>
            </Column>
            <Column field="delete" header="删除">
                <template #body="{ data }">
                    <div>
                        <Button
                            label="删除"
                            size="small"
                            class="whitespace-nowrap news-table-action news-table-action--delete"
                            @click="$event => ConfirmDelete($event, data.nid)"
                        ></Button>
                    </div>
                </template>
            </Column>
        </DataTable>
        <div class="pagination-wrapper">
            <Paginator
                :first="first"
                :rows="size"
                :totalRecords="total"
                :rowsPerPageOptions="[10, 20, 30]"
                @page="handlePageChange"
            ></Paginator>
        </div>
    </div>
</template>

<style scoped>
/* 标题样式 */
.text-3xl {
    color: var(--text-primary);
    transition: color 0.3s ease;
}

.admin-news-page {
    --news-tag-bg: #ecfdf3;
    --news-tag-border: #a7f3d0;
    --news-tag-text: #0f8a62;
    --news-btn-primary-bg: var(--accent-color);
    --news-btn-primary-hover: var(--accent-hover);
    --news-btn-primary-text: #ffffff;
    --news-btn-warning-bg: #5f9188;
    --news-btn-warning-bg-hover: #547f77;
    --news-btn-warning-border: #5f9188;
    --news-btn-warning-text: #f6fbfa;
    --news-btn-edit-bg: #ecfdf3;
    --news-btn-edit-bg-hover: #ddfbe9;
    --news-btn-edit-border: #a7f3d0;
    --news-btn-edit-text: #0f8a62;
    --news-btn-danger-bg: #ffe5e7;
    --news-btn-danger-bg-hover: #ffd9dd;
    --news-btn-danger-border: #f4bcc2;
    --news-btn-danger-text: #c2415b;
}

.dark .admin-news-page {
    --news-tag-bg: rgba(16, 185, 129, 0.18);
    --news-tag-border: rgba(52, 211, 153, 0.34);
    --news-tag-text: #9ef0cd;
    --news-btn-primary-bg: #3f8fdf;
    --news-btn-primary-hover: #58a6ee;
    --news-btn-primary-text: #f8fbff;
    --news-btn-warning-bg: #5a8c84;
    --news-btn-warning-bg-hover: #639990;
    --news-btn-warning-border: #5a8c84;
    --news-btn-warning-text: #f6fbfa;
    --news-btn-edit-bg: rgba(16, 185, 129, 0.18);
    --news-btn-edit-bg-hover: rgba(16, 185, 129, 0.26);
    --news-btn-edit-border: rgba(52, 211, 153, 0.34);
    --news-btn-edit-text: #9ef0cd;
    --news-btn-danger-bg: rgba(239, 68, 68, 0.18);
    --news-btn-danger-bg-hover: rgba(239, 68, 68, 0.26);
    --news-btn-danger-border: rgba(239, 68, 68, 0.34);
    --news-btn-danger-text: #ff9aa5;
}

:deep(.p-datatable-column-title) {
    white-space: nowrap;
}

:deep(.p-datatable) {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

:deep(.p-datatable .p-datatable-header) {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-color);
    padding: 1rem;
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-color);
    padding: 1rem;
    font-weight: 600;
    white-space: nowrap;
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
    background: var(--bg-surface) !important;
    color: var(--text-primary) !important;
    border-bottom: 1px solid var(--border-color) !important;
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 1rem;
    color: var(--text-primary) !important;
    border-bottom: 1px solid var(--border-color) !important;
    background: transparent !important;
    transition: color 0.3s ease, border-color 0.3s ease, background 0.3s ease;
}

/* 确保表格内的所有文字都使用正确的颜色 */
:deep(.p-datatable .p-datatable-tbody > tr > td > div) {
    color: inherit;
}

/* 确保按钮和标签等元素也使用正确的颜色 */
.news-tag-list {
    flex-wrap: wrap;
}

:deep(.news-tag-pill.p-tag) {
    background: var(--news-tag-bg) !important;
    color: var(--news-tag-text) !important;
    border: 1px solid var(--news-tag-border) !important;
    border-radius: 999px !important;
    padding: 0.18rem 0.65rem !important;
    font-weight: 600;
    box-shadow: none !important;
}

:deep(.news-tag-pill .p-tag-label) {
    color: inherit !important;
    font-weight: inherit;
}

:deep(.news-toolbar-btn.p-button),
:deep(.news-table-action.p-button) {
    border-radius: 10px !important;
    border: 1px solid transparent !important;
    font-weight: 600;
    transition:
        background 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.2s ease;
}

:deep(.news-toolbar-btn.p-button) {
    min-height: 2.75rem;
    padding: 0 1.1rem !important;
}

:deep(.news-table-action.p-button) {
    min-height: 2.125rem;
    padding: 0 0.9rem !important;
    box-shadow: none !important;
}

:deep(.news-toolbar-btn .p-button-label),
:deep(.news-toolbar-btn .p-button-icon),
:deep(.news-table-action .p-button-label),
:deep(.news-table-action .p-button-icon) {
    color: inherit !important;
    font-weight: inherit;
}

:deep(.news-toolbar-btn--primary.p-button) {
    background: var(--news-btn-primary-bg) !important;
    color: var(--news-btn-primary-text) !important;
    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.18);
}

:deep(.news-toolbar-btn--primary.p-button:not(:disabled):hover) {
    background: var(--news-btn-primary-hover) !important;
    color: var(--news-btn-primary-text) !important;
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.24);
}

:deep(.news-toolbar-btn--warning.p-button) {
    background: var(--news-btn-warning-bg) !important;
    color: var(--news-btn-warning-text) !important;
    border-color: var(--news-btn-warning-border) !important;
    box-shadow: 0 10px 20px rgba(95, 145, 136, 0.2);
}

:deep(.news-toolbar-btn--warning.p-button:not(:disabled):hover) {
    background: var(--news-btn-warning-bg-hover) !important;
    color: var(--news-btn-warning-text) !important;
    border-color: var(--news-btn-warning-border) !important;
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(95, 145, 136, 0.28);
}

:deep(.news-table-action--edit.p-button) {
    background: var(--news-btn-edit-bg) !important;
    color: var(--news-btn-edit-text) !important;
    border-color: var(--news-btn-edit-border) !important;
}

:deep(.news-table-action--edit.p-button:not(:disabled):hover) {
    background: var(--news-btn-edit-bg-hover) !important;
    color: var(--news-btn-edit-text) !important;
    border-color: var(--news-btn-edit-border) !important;
    transform: translateY(-1px);
}

:deep(.news-table-action--delete.p-button) {
    background: var(--news-btn-danger-bg) !important;
    color: var(--news-btn-danger-text) !important;
    border-color: var(--news-btn-danger-border) !important;
}

:deep(.news-table-action--delete.p-button:not(:disabled):hover) {
    background: var(--news-btn-danger-bg-hover) !important;
    color: var(--news-btn-danger-text) !important;
    border-color: var(--news-btn-danger-border) !important;
    transform: translateY(-1px);
}

:deep(.news-cleanup-dialog.p-confirmdialog) {
    width: min(28rem, calc(100vw - 2rem));
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    box-shadow: 0 22px 60px rgba(15, 23, 42, 0.2);
}

:deep(.news-cleanup-dialog .p-dialog-header) {
    padding: 1.25rem 1.35rem 0.5rem;
    background: var(--bg-surface);
    color: var(--text-primary);
    border-bottom: none;
}

:deep(.news-cleanup-dialog .p-dialog-title) {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-primary);
}

:deep(.news-cleanup-dialog .p-dialog-header-actions .p-dialog-header-icon) {
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 999px;
    color: var(--text-secondary);
    transition: background 0.2s ease, color 0.2s ease;
}

:deep(.news-cleanup-dialog .p-dialog-header-actions .p-dialog-header-icon:hover) {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

:deep(.news-cleanup-dialog .p-dialog-content) {
    padding: 0.5rem 1.35rem 0;
    background: var(--bg-surface);
    color: var(--text-secondary);
    line-height: 1.65;
}

:deep(.news-cleanup-dialog .p-confirmdialog-icon) {
    margin-right: 0.9rem;
    font-size: 1.3rem;
    color: #f59e0b;
}

:deep(.news-cleanup-dialog .p-dialog-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.2rem 1.35rem 1.35rem;
    background: var(--bg-surface);
    border-top: none;
}

:deep(.news-cleanup-dialog .p-dialog-footer .p-button) {
    min-height: 2.7rem;
    padding: 0 1.1rem;
    border-radius: 12px;
    font-weight: 600;
    transition:
        background 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.2s ease;
}

:deep(.news-cleanup-dialog .news-cleanup-cancel.p-button) {
    background: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border-color) !important;
    box-shadow: none !important;
}

:deep(.news-cleanup-dialog .news-cleanup-cancel.p-button:not(:disabled):hover) {
    background: color-mix(in srgb, var(--bg-secondary) 82%, var(--accent-color) 18%) !important;
    color: var(--text-primary) !important;
    border-color: color-mix(in srgb, var(--border-color) 72%, var(--accent-color) 28%) !important;
}

:deep(.news-cleanup-dialog .news-cleanup-confirm.p-button) {
    background: #dc2626 !important;
    color: #fff7f7 !important;
    border: 1px solid #dc2626 !important;
    box-shadow: 0 12px 24px rgba(220, 38, 38, 0.18) !important;
}

:deep(.news-cleanup-dialog .news-cleanup-confirm.p-button:not(:disabled):hover) {
    background: #c81e1e !important;
    color: #fff7f7 !important;
    border-color: #c81e1e !important;
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(220, 38, 38, 0.24) !important;
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

/* Paginator组件样式 - 应用全局CSS变量 */
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
</style>
