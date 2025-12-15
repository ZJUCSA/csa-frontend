<script setup>
import { useConfirm } from 'primevue/useconfirm'

const confirm = useConfirm()
const axios = inject('axios')

const data = ref([])

const show = ref(false)
const show1 = ref(false)

const page = ref(1)
const total = ref(0)
const size = ref(10)

const operator = ref(null)

const ConfirmDelete = (event, eid) => {
    confirm.require({
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
                    fetchContent()
                    window.notyf.success('删除成功')
                })
        },
    })
}

const ConfirmCleanup = (event) => {
    confirm.require({
        target: event.currentTarget,
        message: '确认清理所有24小时前的废弃草稿？此操作将删除旧草稿及其关联图片，且不可恢复。',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: '取消',
            severity: 'secondary',
            outlined: true,
        },
        acceptProps: {
            label: '清理',
            severity: 'danger',
        },
        accept: () => {
            axios
                .post('/admin/cleanup_drafts')
                .then(res => {
                    const d = res.data.details || {
                        news_deleted: 0,
                        events_deleted: 0
                    }
                    window.notyf.success(`清理完成: 删除新闻草稿${d.news_deleted}条, 活动草稿${d.events_deleted}条`)
                })
        },
    })
}

const fetchContent = () => {
    axios
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

axios
    .get('/event/count')
    .then(res => {
        total.value = res.data.count
    })
    .then(() => {
        fetchContent()
    })

watch([page, size], () => {
    fetchContent()
})
</script>

<template>
    <csa-edit-event
        v-model:show="show"
        @finish="fetchContent"
        :eid="operator"
    ></csa-edit-event>
    <csa-edit-signin v-model:show="show1" :eid="operator"></csa-edit-signin>
    <ConfirmPopup></ConfirmPopup>
    <div class="main-part-lg mx-auto">
        <div class="text-3xl font-bold mb-6">活动管理</div>
        <Button
            label="创建活动"
            class="mb-4"
            @click="
                () => {
                    show = true
                    operator = null
                }
            "
        ></Button>
        <Button
            label="清理废弃草稿"
            class="mb-4 ml-2"
            severity="warning"
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
                                class="whitespace-nowrap"
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
                                severity="info"
                                class="whitespace-nowrap"
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
                                severity="danger"
                                size="small"
                                class="whitespace-nowrap"
                                @click="$event => ConfirmDelete($event, data.eid)"
                            ></Button>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
        <div class="pagination-wrapper">
            <Paginator
                v-model:page="page"
                v-model:rows="size"
                :totalRecords="total"
                :rowsPerPageOptions="[10, 20, 30]"
            ></Paginator>
        </div>
    </div>
</template>

<style>
.p-datatable-column-title {
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

.overflow-x-auto :deep(.p-datatable .p-datatable-tbody > tr > td *) {
    color: var(--text-primary) !important;
}

.overflow-x-auto :deep(.p-datatable .p-datatable-tbody > tr > td .p-button) {
    color: inherit;
}

.overflow-x-auto :deep(.p-datatable .p-datatable-tbody > tr > td .p-tag) {
    color: inherit;
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

.pagination-wrapper :deep(.p-paginator-page.p-highlight) {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
}

.pagination-wrapper :deep(.p-paginator-current) {
    color: var(--text-primary);
}
</style>
