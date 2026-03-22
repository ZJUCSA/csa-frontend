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
    <ConfirmPopup></ConfirmPopup>
    <div class="main-part-lg mx-auto">
        <div class="text-3xl font-bold mb-6">信息管理</div>
        <Button
            label="创建信息"
            class="mb-4"
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
            class="mb-4 ml-2"
            severity="warning"
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
                    <div class="flex gap-1" v-if="data.tag">
                        <div v-for="tag in data.tag.split(' ')" :key="tag">
                            <Tag :value="tag" class="text-nowrap"></Tag>
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
                            severity="danger"
                            size="small"
                            class="whitespace-nowrap"
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
:deep(.p-datatable .p-datatable-tbody > tr > td *) {
    color: var(--text-primary) !important;
}

/* 确保按钮和标签等元素也使用正确的颜色 */
:deep(.p-datatable .p-datatable-tbody > tr > td .p-button) {
    color: inherit;
}

:deep(.p-datatable .p-datatable-tbody > tr > td .p-tag) {
    color: inherit;
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
