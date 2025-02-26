<script setup>
import { useConfirm } from 'primevue/useconfirm'

const confirm = useConfirm()
const axios = inject('axios')

const data = ref([])

const show = ref(false)
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
        <DataTable :value="data" class="mb-4">
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

<style>
.p-datatable-column-title {
    white-space: nowrap;
}
</style>
