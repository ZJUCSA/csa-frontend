<script setup>
import { useConfirm } from 'primevue/useconfirm'
import { userRole, adminRole } from '@/const'
import { useUserStore } from '@/stores/user'

const confirm = useConfirm()
const axios = inject('axios')
const userStore = useUserStore()

const data = ref([])

const show = ref(false)
const page = ref(1)
const total = ref(0)
const size = ref(10)
const s = ref('')
const first = computed(() => Math.max(0, (page.value - 1) * size.value))

const operator = ref(null)

const selectedUserRole = ref(null)
const selectedAdminRole = ref(null)

const fetchTotal = () => {
    return axios.get('/admin/user_count').then(res => {
        total.value = res.data.user_count
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

const ConfirmDelete = (event, uid) => {
    confirm.require({
        target: event.currentTarget,
        group: 'user-delete',
        message: '确认删除该用户？',
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
                .post('/admin/delete_user', {
                    uid: uid,
                })
                .then(() => {
                    refreshContent()
                    window.notyf.success('删除成功')
                })
        },
    })
}

const ConfirmChange = (event, data) => {
    selectedUserRole.value = data.rid
    selectedAdminRole.value = data.is_admin ? data.admin_rid : 0
    console.log(data)
    confirm.require({
        target: event.currentTarget,
        group: 'role',
        modal: true,
        header: '更改用户角色',
        message: `您正在修改 ${data.uid} ${data.nick} 的角色`,
        rejectProps: {
            label: '取消',
            severity: 'secondary',
            outlined: true,
            class: 'user-role-cancel',
        },
        acceptProps: {
            label: '修改',
            severity: 'danger',
            class: 'user-role-confirm',
        },
        accept: () => {
            // step1 更改用户角色
            axios
                .post('/admin/update_user_role', {
                    uid: data.uid,
                    rid: selectedUserRole.value,
                })
                .then(res => {
                    window.notyf.success(res.data.msg)
                    if (data.uid === userStore.uid) return
                    if (data.is_admin && selectedAdminRole.value === 0) {
                        // 如果是管理员，且选择的管理员角色为0，则删除管理员角色
                        return axios.post('/admin/deauthor', {
                            uid_deauthored: data.uid,
                        })
                    } else if (
                        data.is_admin &&
                        selectedAdminRole.value !== data.admin_rid
                    ) {
                        // 如果是管理员，且选择的管理员角色更改过，则更改管理员角色
                        return axios.post('/admin/deauthor', {
                            uid_deauthored: data.uid,
                            rid_deauthored: selectedAdminRole.value,
                        })
                    } else if (
                        !data.is_admin &&
                        selectedAdminRole.value !== 0
                    ) {
                        // 如果不是管理员，且选择的管理员角色不为0，则添加管理员角色
                        return axios.post('/admin/author', {
                            uid_authored: data.uid,
                            rid_authored: selectedAdminRole.value,
                        })
                    }
                })
                .then(res => {
                    if (res) window.notyf.success(res.data.msg)
                    refreshContent()
                })
        },
    })
}

const fetchContent = () => {
    return axios
        .get('/admin/user_list', {
            params: {
                page: page.value,
                size: size.value,
                s: s.value,
            },
        })
        .then(res => {
            data.value = res.data
        })
}

refreshContent()

const getRoleUser = rid => {
    if (!rid) return '会员'
    return userRole.find(item => item.rid === rid)?.role_name
}

const getRoleAdmin = rid => {
    if (!rid) return '无'
    return adminRole.find(item => item.rid === rid)?.role_name
}

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
    <ConfirmPopup group="user-delete"></ConfirmPopup>
    <ConfirmDialog group="role" class="user-role-dialog">
        <template #message="slotProps">
            <div class="user-role-dialog-body">
                <div class="mb-4 font-bold user-role-dialog-message">
                    {{ slotProps.message.message }}
                </div>
                <div class="mb-2 user-role-dialog-label">选择用户角色</div>
                <Select
                    v-model="selectedUserRole"
                    :options="userRole"
                    size="small"
                    optionLabel="role_name"
                    optionValue="rid"
                    placeholder="选择用户角色"
                    class="w-full"
                />
                <div class="mb-2 mt-3 user-role-dialog-label">选择管理员角色</div>
                <Select
                    v-model="selectedAdminRole"
                    :options="adminRole"
                    size="small"
                    optionLabel="role_name"
                    optionValue="rid"
                    placeholder="选择管理员角色"
                    class="w-full"
                />
            </div>
        </template>
    </ConfirmDialog>
    <div class="main-part-lg mx-auto admin-user-page">
        <div class="text-3xl font-bold mb-6">用户管理</div>
        <div class="mb-6 items-center">
            <InputText type="text" size="small" v-model="s" />
            <Button
                label="搜索"
                icon="pi pi-search"
                size="small"
                class="ml-2 user-search-btn"
                @click="fetchContent"
            ></Button>
        </div>
        <div class="overflow-x-auto mb-4">
            <DataTable :value="data" class="min-w-full">
                <Column field="uid" header="编号"></Column>
                <Column field="nick" header="姓名">
                    <template #body="{ data }">
                        <div class="min-w-32">{{ data.nick }}</div>
                    </template>
                </Column>
                <Column field="category" header="类型">
                    <template #body="{ data }">
                        <div>{{ getRoleUser(data.rid) }}</div>
                    </template>
                </Column>
                <Column field="category" header="管理角色">
                    <template #body="{ data }">
                        <div>{{ getRoleAdmin(data.admin_rid) }}</div>
                    </template>
                </Column>
                <Column field="last_login" header="上次登录">
                    <template #body="{ data }">
                        <div>
                            {{
                                data.last_login
                                    ? new Date(
                                          data.last_login * 1000
                                      ).toLocaleString()
                                    : '未登录'
                            }}
                        </div>
                    </template>
                </Column>
                <Column field="edit" header="更改类型">
                    <template #body="{ data }">
                        <div>
                            <Button
                                label="修改"
                                size="small"
                                class="whitespace-nowrap user-table-action user-table-action--edit"
                                @click="$event => ConfirmChange($event, data)"
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
                                class="whitespace-nowrap user-table-action user-table-action--delete"
                                @click="$event => ConfirmDelete($event, data.uid)"
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

.admin-user-page {
    --user-btn-search-bg: var(--accent-color);
    --user-btn-search-bg-hover: var(--accent-hover);
    --user-btn-search-border: var(--accent-color);
    --user-btn-search-text: #ffffff;
    --user-btn-edit-bg: #e6f1ff;
    --user-btn-edit-bg-hover: #d8e9ff;
    --user-btn-edit-border: #bfd8ff;
    --user-btn-edit-text: #2f73da;
    --user-btn-danger-bg: #ffe5e7;
    --user-btn-danger-bg-hover: #ffd9dd;
    --user-btn-danger-border: #f4bcc2;
    --user-btn-danger-text: #c2415b;
}

.dark .admin-user-page {
    --user-btn-search-bg: #3f8fdf;
    --user-btn-search-bg-hover: #58a6ee;
    --user-btn-search-border: #3f8fdf;
    --user-btn-search-text: #f8fbff;
    --user-btn-edit-bg: rgba(59, 130, 246, 0.2);
    --user-btn-edit-bg-hover: rgba(59, 130, 246, 0.28);
    --user-btn-edit-border: rgba(96, 165, 250, 0.34);
    --user-btn-edit-text: #a9cbff;
    --user-btn-danger-bg: rgba(239, 68, 68, 0.18);
    --user-btn-danger-bg-hover: rgba(239, 68, 68, 0.26);
    --user-btn-danger-border: rgba(239, 68, 68, 0.34);
    --user-btn-danger-text: #ff9aa5;
}

/* InputText 组件样式 */
:deep(.p-inputtext) {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

:deep(.p-inputtext:focus) {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

:deep(.user-search-btn.p-button) {
    min-height: 2.5rem;
    padding: 0 1rem !important;
    border-radius: 10px !important;
    border: 1px solid var(--user-btn-search-border) !important;
    background: var(--user-btn-search-bg) !important;
    color: var(--user-btn-search-text) !important;
    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.18) !important;
    transition:
        background 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.2s ease;
}

:deep(.user-search-btn .p-button-label),
:deep(.user-search-btn .p-button-icon) {
    color: inherit !important;
}

:deep(.user-search-btn.p-button:not(:disabled):hover) {
    background: var(--user-btn-search-bg-hover) !important;
    color: var(--user-btn-search-text) !important;
    border-color: var(--user-btn-search-border) !important;
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.24) !important;
}

:deep(.p-datatable-column-title) {
    white-space: nowrap;
}

/* DataTable组件样式 - 应用全局CSS变量 */
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

:deep(.user-table-action.p-button) {
    min-height: 2.125rem;
    padding: 0 0.9rem !important;
    border-radius: 10px !important;
    border: 1px solid transparent !important;
    font-weight: 600;
    box-shadow: none !important;
    transition:
        background 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
}

:deep(.user-table-action .p-button-label),
:deep(.user-table-action .p-button-icon) {
    color: inherit !important;
    font-weight: inherit;
}

:deep(.user-table-action--edit.p-button) {
    background: var(--user-btn-edit-bg) !important;
    color: var(--user-btn-edit-text) !important;
    border-color: var(--user-btn-edit-border) !important;
}

:deep(.user-table-action--edit.p-button:not(:disabled):hover) {
    background: var(--user-btn-edit-bg-hover) !important;
    color: var(--user-btn-edit-text) !important;
    border-color: var(--user-btn-edit-border) !important;
    transform: translateY(-1px);
}

:deep(.user-table-action--delete.p-button) {
    background: var(--user-btn-danger-bg) !important;
    color: var(--user-btn-danger-text) !important;
    border-color: var(--user-btn-danger-border) !important;
}

:deep(.user-table-action--delete.p-button:not(:disabled):hover) {
    background: var(--user-btn-danger-bg-hover) !important;
    color: var(--user-btn-danger-text) !important;
    border-color: var(--user-btn-danger-border) !important;
    transform: translateY(-1px);
}

:deep(.user-role-dialog.p-confirmdialog) {
    width: min(30rem, calc(100vw - 2rem));
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    box-shadow: 0 22px 60px rgba(15, 23, 42, 0.2);
}

:deep(.user-role-dialog .p-dialog-header) {
    padding: 1.25rem 1.35rem 0.5rem;
    background: var(--bg-surface);
    color: var(--text-primary);
    border-bottom: none;
}

:deep(.user-role-dialog .p-dialog-title) {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-primary);
}

:deep(.user-role-dialog .p-dialog-header-actions .p-dialog-header-icon) {
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 999px;
    color: var(--text-secondary);
    transition: background 0.2s ease, color 0.2s ease;
}

:deep(.user-role-dialog .p-dialog-header-actions .p-dialog-header-icon:hover) {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

:deep(.user-role-dialog .p-dialog-content) {
    padding: 0.45rem 1.35rem 0;
    background: var(--bg-surface);
    color: var(--text-secondary);
}

.user-role-dialog-body {
    width: min(100%, 18rem);
}

.user-role-dialog-message {
    color: var(--text-primary);
    line-height: 1.6;
}

.user-role-dialog-label {
    color: var(--text-secondary);
    font-size: 0.95rem;
    font-weight: 600;
}

:deep(.user-role-dialog .p-select) {
    min-height: 2.75rem;
    border-radius: 12px;
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

:deep(.user-role-dialog .p-select:not(.p-disabled):hover) {
    border-color: color-mix(in srgb, var(--border-color) 64%, var(--accent-color) 36%);
}

:deep(.user-role-dialog .p-select.p-focus) {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

:deep(.user-role-dialog .p-select-label),
:deep(.user-role-dialog .p-select-dropdown) {
    color: inherit;
}

:deep(.user-role-dialog .p-dialog-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.2rem 1.35rem 1.35rem;
    background: var(--bg-surface);
    border-top: none;
}

:deep(.user-role-dialog .p-dialog-footer .p-button) {
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

:deep(.user-role-dialog .user-role-cancel.p-button) {
    background: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border-color) !important;
    box-shadow: none !important;
}

:deep(.user-role-dialog .user-role-cancel.p-button:not(:disabled):hover) {
    background: color-mix(in srgb, var(--bg-secondary) 82%, var(--accent-color) 18%) !important;
    color: var(--text-primary) !important;
    border-color: color-mix(in srgb, var(--border-color) 72%, var(--accent-color) 28%) !important;
}

:deep(.user-role-dialog .user-role-confirm.p-button) {
    background: var(--accent-color) !important;
    color: #ffffff !important;
    border: 1px solid var(--accent-color) !important;
    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.18) !important;
}

:deep(.user-role-dialog .user-role-confirm.p-button:not(:disabled):hover) {
    background: var(--accent-hover) !important;
    color: #ffffff !important;
    border-color: var(--accent-hover) !important;
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(99, 102, 241, 0.24) !important;
}

/* Paginator组件样式 - 应用全局CSS变量 */
.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

:deep(.p-paginator) {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 10px;
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

:deep(.p-paginator-page),
:deep(.p-paginator-first),
:deep(.p-paginator-prev),
:deep(.p-paginator-next),
:deep(.p-paginator-last) {
    background: var(--bg-surface);
    color: var(--text-primary);
    border-color: var(--border-color);
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

:deep(.p-paginator-page:hover),
:deep(.p-paginator-first:hover),
:deep(.p-paginator-prev:hover),
:deep(.p-paginator-next:hover),
:deep(.p-paginator-last:hover) {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

:deep(.p-paginator-page.p-paginator-page-selected) {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
}

:deep(.p-paginator-rpp-dropdown) {
    min-height: 2.5rem;
    border-radius: 14px;
    border: 1px solid var(--border-color);
    background: var(--bg-surface);
    color: var(--text-primary);
}

:deep(.p-paginator-rpp-dropdown:not(.p-disabled):hover) {
    border-color: color-mix(in srgb, var(--border-color) 72%, var(--accent-color) 28%);
}

:deep(.p-paginator-rpp-dropdown.p-focus) {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

:deep(.p-paginator-rpp-dropdown .p-select-label),
:deep(.p-paginator-rpp-dropdown .p-select-dropdown) {
    color: inherit;
}

:deep(.p-paginator-current) {
    color: var(--text-primary);
    font-weight: 600;
    padding: 0 0.25rem;
}
</style>
