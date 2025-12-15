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

const operator = ref(null)

const selectedUserRole = ref(null)
const selectedAdminRole = ref(null)

const ConfirmDelete = (event, uid) => {
    confirm.require({
        target: event.currentTarget,
        group: 'delete',
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
                    fetchContent()
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
        },
        acceptProps: {
            label: '修改',
            severity: 'danger',
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
                    fetchContent()
                })
        },
    })
}

const fetchContent = () => {
    axios
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

axios
    .get('/news/count')
    .then(res => {
        total.value = res.data.count
    })
    .then(() => {
        fetchContent()
    })

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
        @finish="fetchContent"
        :nid="operator"
    ></csa-edit-news>
    <ConfirmPopup group="delete"></ConfirmPopup>
    <ConfirmDialog group="role">
        <template #message="slotProps">
            <div class="m-2 w-64">
                <div class="mb-4 font-bold">
                    {{ slotProps.message.message }}
                </div>
                <div class="mb-2">选择用户角色</div>
                <Select
                    v-model="selectedUserRole"
                    :options="userRole"
                    size="small"
                    optionLabel="role_name"
                    optionValue="rid"
                    placeholder="选择用户角色"
                    class="w-full"
                />
                <div class="mb-2 mt-3">选择管理员角色</div>
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
    <div class="main-part-lg mx-auto">
        <div class="text-3xl font-bold mb-6">用户管理</div>
        <div class="mb-6 items-center">
            <InputText type="text" size="small" v-model="s" />
            <Button
                label="搜索"
                icon="pi pi-search"
                size="small"
                class="ml-2"
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
                                severity="info"
                                size="small"
                                class="whitespace-nowrap"
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
                                severity="danger"
                                size="small"
                                class="whitespace-nowrap"
                                @click="$event => ConfirmDelete($event, data.uid)"
                            ></Button>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
        <div class="flex justify-end">
            <Paginator
                v-model:page="page"
                v-model:rows="size"
                :totalRecords="total"
                :rowsPerPageOptions="[10, 20, 30]"
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

.p-datatable-column-title {
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

/* Paginator组件样式 - 应用全局CSS变量 */
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

:deep(.p-paginator-page.p-highlight) {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
}

:deep(.p-paginator-current) {
    color: var(--text-primary);
}
</style>
