<script setup>
import { computed } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useUserStore } from '@/stores/user'

const confirm = useConfirm()
const axios = inject('axios')
const userStore = useUserStore()

// 检查是否为管理员（rid=7）
const isManager = computed(() => userStore.admin_role_id === 7)

const data = ref([])

const show = ref(false)
const show1 = ref(false)

const page = ref(1)
const total = ref(0)
const size = ref(10)
const first = computed(() => Math.max(0, (page.value - 1) * size.value))

const operator = ref(null)

const fetchTotal = () => {
    return axios.get('/event/count').then(res => {
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

const ConfirmDelete = (event, eid) => {
    confirm.require({
        group: 'event-delete',
        target: event.currentTarget,
        message: '确认删除该活动？',
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
                .post('/delete/event', {
                    eid: eid,
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
        group: 'event-cleanup',
        modal: true,
        header: '清理废弃草稿',
        message: '确认清理所有24小时前的废弃草稿？此操作将删除旧草稿及其关联图片，且不可恢复。',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: '取消',
            severity: 'secondary',
            outlined: true,
            class: 'event-cleanup-cancel',
        },
        acceptProps: {
            label: '清理',
            severity: 'danger',
            class: 'event-cleanup-confirm',
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
        .get('/event/list', {
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
    <csa-edit-event
        v-model:show="show"
        @finish="refreshContent"
        :eid="operator"
    ></csa-edit-event>
    <csa-edit-signin v-model:show="show1" :eid="operator"></csa-edit-signin>
    <ConfirmPopup group="event-delete"></ConfirmPopup>
    <ConfirmDialog group="event-cleanup" class="event-cleanup-dialog"></ConfirmDialog>
    <div class="main-part-lg mx-auto admin-event-page">
        <div class="text-3xl font-bold mb-6">活动管理</div>
        <Button
            label="创建活动"
            class="mb-4 event-toolbar-btn event-toolbar-btn--primary"
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
            class="mb-4 ml-2 event-toolbar-btn event-toolbar-btn--warning"
            @click="ConfirmCleanup"
        ></Button>
        <div class="overflow-x-auto mb-4">
            <DataTable :value="data" class="min-w-full">
                <Column field="eid" header="编号"></Column>
                <Column field="title" header="标题">
                    <template #body="{ data }">
                        <div class="min-w-48">{{ data.title }}</div>
                    </template>
                </Column>
                <Column field="tag" header="活动时间">
                    <template #body="{ data }">
                        <div class="flex flex-col gap-y-1">
                            <div>
                                {{
                                    new Date(
                                        data.start_time * 1000
                                    ).toLocaleString()
                                }}
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
                                class="whitespace-nowrap event-table-action event-table-action--edit"
                                @click="
                                    () => {
                                        operator = data.eid
                                        show = true
                                    }
                                "
                            ></Button>
                        </div>
                    </template>
                </Column>
                <Column field="edit" header="签到管理">
                    <template #body="{ data }">
                        <div>
                            <Button
                                label="签到"
                                size="small"
                                class="whitespace-nowrap event-table-action event-table-action--signin"
                                @click="
                                    () => {
                                        operator = data.eid
                                        show1 = true
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
                                class="whitespace-nowrap event-table-action event-table-action--delete"
                                @click="$event => ConfirmDelete($event, data.eid)"
                            ></Button>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
        <div class="pagination-wrapper">
            <Paginator
                :first="first"
                :rows="size"
                :totalRecords="total"
                :rowsPerPageOptions="[10, 20, 30]"
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
                currentPageReportTemplate="第 {currentPage} 页，共 {totalPages} 页"
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

.admin-event-page {
    --event-btn-primary-bg: var(--accent-color);
    --event-btn-primary-hover: var(--accent-hover);
    --event-btn-primary-text: #ffffff;
    --event-btn-primary-shadow: 0 10px 20px rgba(99, 102, 241, 0.18);
    --event-btn-primary-shadow-hover: 0 12px 24px rgba(99, 102, 241, 0.24);
    --event-btn-warning-bg: #7b88b8;
    --event-btn-warning-bg-hover: #6d7aa8;
    --event-btn-warning-border: #7b88b8;
    --event-btn-warning-text: #f8fbff;
    --event-btn-warning-shadow: 0 10px 20px rgba(123, 136, 184, 0.2);
    --event-btn-warning-shadow-hover: 0 12px 24px rgba(123, 136, 184, 0.28);
    --event-btn-edit-bg: #ecfdf3;
    --event-btn-edit-bg-hover: #ddfbe9;
    --event-btn-edit-border: #a7f3d0;
    --event-btn-edit-text: #0f8a62;
    --event-btn-signin-bg: #e6f1ff;
    --event-btn-signin-bg-hover: #d8e9ff;
    --event-btn-signin-border: #bfd8ff;
    --event-btn-signin-text: #2f73da;
    --event-btn-danger-bg: #ffe5e7;
    --event-btn-danger-bg-hover: #ffd9dd;
    --event-btn-danger-border: #f4bcc2;
    --event-btn-danger-text: #c2415b;
}

.dark .admin-event-page {
    --event-btn-primary-bg: #3f8fdf;
    --event-btn-primary-hover: #58a6ee;
    --event-btn-primary-text: #f8fbff;
    --event-btn-primary-shadow: 0 12px 28px rgba(15, 23, 42, 0.24);
    --event-btn-primary-shadow-hover: 0 14px 32px rgba(15, 23, 42, 0.32);
    --event-btn-warning-bg: #7389bd;
    --event-btn-warning-bg-hover: #84a0d8;
    --event-btn-warning-border: #7389bd;
    --event-btn-warning-text: #f8fbff;
    --event-btn-warning-shadow: 0 12px 28px rgba(15, 23, 42, 0.24);
    --event-btn-warning-shadow-hover: 0 14px 32px rgba(15, 23, 42, 0.32);
    --event-btn-edit-bg: rgba(16, 185, 129, 0.18);
    --event-btn-edit-bg-hover: rgba(16, 185, 129, 0.26);
    --event-btn-edit-border: rgba(52, 211, 153, 0.34);
    --event-btn-edit-text: #9ef0cd;
    --event-btn-signin-bg: rgba(59, 130, 246, 0.2);
    --event-btn-signin-bg-hover: rgba(59, 130, 246, 0.28);
    --event-btn-signin-border: rgba(96, 165, 250, 0.34);
    --event-btn-signin-text: #a9cbff;
    --event-btn-danger-bg: rgba(239, 68, 68, 0.18);
    --event-btn-danger-bg-hover: rgba(239, 68, 68, 0.26);
    --event-btn-danger-border: rgba(239, 68, 68, 0.34);
    --event-btn-danger-text: #ff9aa5;
}

:deep(.p-datatable-column-title) {
    white-space: nowrap;
}

.overflow-x-auto :deep(.p-datatable) {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.overflow-x-auto :deep(.p-datatable .p-datatable-header) {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-color);
    padding: 1rem;
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.overflow-x-auto :deep(.p-datatable .p-datatable-thead > tr > th) {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-color);
    padding: 1rem;
    font-weight: 600;
    white-space: nowrap;
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.overflow-x-auto :deep(.p-datatable .p-datatable-tbody > tr) {
    background: var(--bg-surface) !important;
    color: var(--text-primary) !important;
    border-bottom: 1px solid var(--border-color) !important;
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.overflow-x-auto :deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
}

.overflow-x-auto :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 1rem;
    color: var(--text-primary) !important;
    border-bottom: 1px solid var(--border-color) !important;
    background: transparent !important;
    transition: color 0.3s ease, border-color 0.3s ease, background 0.3s ease;
}

.overflow-x-auto :deep(.p-datatable .p-datatable-tbody > tr > td > div) {
    color: inherit;
}

:deep(.event-toolbar-btn.p-button),
:deep(.event-table-action.p-button) {
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

:deep(.event-toolbar-btn.p-button) {
    min-height: 2.75rem;
    padding: 0 1.1rem !important;
}

:deep(.event-table-action.p-button) {
    min-height: 2.125rem;
    padding: 0 0.9rem !important;
    box-shadow: none !important;
}

:deep(.event-toolbar-btn .p-button-label),
:deep(.event-toolbar-btn .p-button-icon),
:deep(.event-table-action .p-button-label),
:deep(.event-table-action .p-button-icon) {
    color: inherit !important;
    font-weight: inherit;
}

:deep(.event-toolbar-btn--primary.p-button) {
    background: var(--event-btn-primary-bg) !important;
    color: var(--event-btn-primary-text) !important;
    box-shadow: var(--event-btn-primary-shadow) !important;
}

:deep(.event-toolbar-btn--primary.p-button:not(:disabled):hover) {
    background: var(--event-btn-primary-hover) !important;
    color: var(--event-btn-primary-text) !important;
    transform: translateY(-1px);
    box-shadow: var(--event-btn-primary-shadow-hover) !important;
}

:deep(.event-toolbar-btn--warning.p-button) {
    background: var(--event-btn-warning-bg) !important;
    color: var(--event-btn-warning-text) !important;
    border-color: var(--event-btn-warning-border) !important;
    box-shadow: var(--event-btn-warning-shadow) !important;
}

:deep(.event-toolbar-btn--warning.p-button:not(:disabled):hover) {
    background: var(--event-btn-warning-bg-hover) !important;
    color: var(--event-btn-warning-text) !important;
    border-color: var(--event-btn-warning-border) !important;
    transform: translateY(-1px);
    box-shadow: var(--event-btn-warning-shadow-hover) !important;
}

:deep(.event-table-action--edit.p-button) {
    background: var(--event-btn-edit-bg) !important;
    color: var(--event-btn-edit-text) !important;
    border-color: var(--event-btn-edit-border) !important;
}

:deep(.event-table-action--edit.p-button:not(:disabled):hover) {
    background: var(--event-btn-edit-bg-hover) !important;
    color: var(--event-btn-edit-text) !important;
    border-color: var(--event-btn-edit-border) !important;
    transform: translateY(-1px);
}

:deep(.event-table-action--signin.p-button) {
    background: var(--event-btn-signin-bg) !important;
    color: var(--event-btn-signin-text) !important;
    border-color: var(--event-btn-signin-border) !important;
}

:deep(.event-table-action--signin.p-button:not(:disabled):hover) {
    background: var(--event-btn-signin-bg-hover) !important;
    color: var(--event-btn-signin-text) !important;
    border-color: var(--event-btn-signin-border) !important;
    transform: translateY(-1px);
}

:deep(.event-table-action--delete.p-button) {
    background: var(--event-btn-danger-bg) !important;
    color: var(--event-btn-danger-text) !important;
    border-color: var(--event-btn-danger-border) !important;
}

:deep(.event-table-action--delete.p-button:not(:disabled):hover) {
    background: var(--event-btn-danger-bg-hover) !important;
    color: var(--event-btn-danger-text) !important;
    border-color: var(--event-btn-danger-border) !important;
    transform: translateY(-1px);
}

:deep(.event-cleanup-dialog.p-confirmdialog) {
    width: min(28rem, calc(100vw - 2rem));
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    box-shadow: 0 22px 60px rgba(15, 23, 42, 0.2);
}

:deep(.event-cleanup-dialog .p-dialog-header) {
    padding: 1.25rem 1.35rem 0.5rem;
    background: var(--bg-surface);
    color: var(--text-primary);
    border-bottom: none;
}

:deep(.event-cleanup-dialog .p-dialog-title) {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-primary);
}

:deep(.event-cleanup-dialog .p-dialog-header-actions .p-dialog-header-icon) {
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 999px;
    color: var(--text-secondary);
    transition: background 0.2s ease, color 0.2s ease;
}

:deep(.event-cleanup-dialog .p-dialog-header-actions .p-dialog-header-icon:hover) {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

:deep(.event-cleanup-dialog .p-dialog-content) {
    padding: 0.5rem 1.35rem 0;
    background: var(--bg-surface);
    color: var(--text-secondary);
    line-height: 1.65;
}

:deep(.event-cleanup-dialog .p-confirmdialog-icon) {
    margin-right: 0.9rem;
    font-size: 1.3rem;
    color: #f59e0b;
}

:deep(.event-cleanup-dialog .p-dialog-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.2rem 1.35rem 1.35rem;
    background: var(--bg-surface);
    border-top: none;
}

:deep(.event-cleanup-dialog .p-dialog-footer .p-button) {
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

:deep(.event-cleanup-dialog .event-cleanup-cancel.p-button) {
    background: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border-color) !important;
    box-shadow: none !important;
}

:deep(.event-cleanup-dialog .event-cleanup-cancel.p-button:not(:disabled):hover) {
    background: color-mix(in srgb, var(--bg-secondary) 82%, var(--accent-color) 18%) !important;
    color: var(--text-primary) !important;
    border-color: color-mix(in srgb, var(--border-color) 72%, var(--accent-color) 28%) !important;
}

:deep(.event-cleanup-dialog .event-cleanup-confirm.p-button) {
    background: #dc2626 !important;
    color: #fff7f7 !important;
    border: 1px solid #dc2626 !important;
    box-shadow: 0 12px 24px rgba(220, 38, 38, 0.18) !important;
}

:deep(.event-cleanup-dialog .event-cleanup-confirm.p-button:not(:disabled):hover) {
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

.pagination-wrapper :deep(.p-paginator-page.p-paginator-page-selected) {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
}

.pagination-wrapper :deep(.p-paginator-rpp-dropdown) {
    min-height: 2.5rem;
    border-radius: 14px;
    border: 1px solid var(--border-color);
    background: var(--bg-surface);
    color: var(--text-primary);
}

.pagination-wrapper :deep(.p-paginator-rpp-dropdown:not(.p-disabled):hover) {
    border-color: color-mix(in srgb, var(--border-color) 72%, var(--accent-color) 28%);
}

.pagination-wrapper :deep(.p-paginator-rpp-dropdown.p-focus) {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.pagination-wrapper :deep(.p-paginator-rpp-dropdown .p-select-label),
.pagination-wrapper :deep(.p-paginator-rpp-dropdown .p-select-dropdown) {
    color: inherit;
}

.pagination-wrapper :deep(.p-paginator-current) {
    color: var(--text-primary);
    font-weight: 600;
    padding: 0 0.25rem;
}
</style>
