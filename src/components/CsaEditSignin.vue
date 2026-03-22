<script setup>
const axios = inject('axios')

const props = defineProps(['show', 'eid'])
const emits = defineEmits(['update:show'])

const loading = ref(false)

const visible = computed({
    get() {
        return props.show
    },
    set(value) {
        emits('update:show', value)
    },
})

const data = reactive({
    start_signin_time: 0,
    end_singin_time: 0,
    signin_code: '',
})

const page = ref(1)
const total = ref(0)
const size = ref(10)

const SigninList = ref([])

const submit = () => {
    axios
        .post('/edit/signin', {
            eid: props.eid,
            start_signin_time: Date.parse(data.start_signin_time) / 1000,
            end_signin_time: Date.parse(data.end_signin_time) / 1000,
            signin_code: data.signin_code,
        })
        .then(() => {
            window.notyf.success('刷新成功')
        })
}

const generateCode = () => {
    // check time
    if (
        data.start_signin_time > Date.now() ||
        data.end_signin_time < Date.now()
    ) {
        data.signin_code = ''
        return
    }
    // randomly generate 6 digits code
    const code = Math.floor(Math.random() * 1000000)
    data.signin_code = String(code).padStart(6, '0')
    submit()
}

const fetchNameList = () => {
    axios
        .get('/event/participations', {
            params: {
                eid: props.eid,
                page: page.value,
                size: size.value,
            },
        })
        .then(res => {
            total.value = res.data.count
            SigninList.value = res.data.result
        })

    if (
        data.start_signin_time > Date.now() ||
        data.end_signin_time < Date.now()
    ) {
        clearInterval(timer2)
    }
}

const downloadNameList = () => {
    axios
        .get('/event/participations', {
            params: {
                eid: props.eid,
                page: 1,
                size: 0,
            },
        })
        .then(res => {
            // construct a csv file
            const csv = res.data.result
                .map(item => {
                    return `${item.uid},${item.nick},${new Date(
                        item.participation_time * 1000
                    ).toLocaleString()}`
                })
                .join('\n')
            const header = '学号,姓名,签到时间\n'
            const filename = `签到名单_${props.eid}_${new Date().toLocaleString()}.csv`
            const blob = new Blob([header + csv], {
                type: 'text/csv;charset=utf-8;',
            })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.setAttribute('download', filename)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(link.href)
        })
}

let timer1 = null
let timer2 = null

onUnmounted(() => {
    clearInterval(timer1)
    clearInterval(timer2)
})

watch(visible, value => {
    if (value) {
        console.log(props.eid)
        if (props.eid) {
            loading.value = true
            axios
                .get('/event/detail', {
                    params: {
                        eid: props.eid,
                    },
                })
                .then(res => {
                    if (res.data.start_signin_time) {
                        data.start_signin_time = new Date(
                            res.data.start_signin_time * 1000
                        )
                    } else {
                        data.start_signin_time = new Date()
                    }
                    if (res.data.end_signin_time) {
                        data.end_signin_time = new Date(
                            res.data.end_signin_time * 1000
                        )
                    } else {
                        // + 10 min
                        data.end_signin_time = new Date(
                            Date.now() + 10 * 60 * 1000
                        )
                    }

                    generateCode()
                    timer1 = setInterval(generateCode, 30 * 1000)

                    fetchNameList()
                    timer2 = setInterval(fetchNameList, 1000)

                    loading.value = false
                })
        }
    } else {
        clearInterval(timer1)
        clearInterval(timer2)
    }
})
</script>

<template>
    <Dialog
            v-model:visible="visible"
            modal
            header="签到管理"
            :style="{ width: '50rem' }"
        >
            <div class="mx-8" v-if="!loading">
                <div class="flex gap-x-8 flex-wrap">
                    <div class="flex items-center gap-4 mb-4">
                        <label>开始时间</label>
                        <DatePicker
                            showTime
                            hourFormat="24"
                            fluid
                            dateFormat="yy-mm-dd"
                            v-model="data.start_signin_time"
                        />
                    </div>

                    <div class="flex items-center gap-4 mb-4">
                        <label>结束时间</label>
                        <DatePicker
                            showTime
                            hourFormat="24"
                            fluid
                            dateFormat="yy-mm-dd"
                            v-model="data.end_signin_time"
                        />
                    </div>

                    <div>
                        <Button
                            type="button"
                            label="提交"
                            @click="generateCode"
                        ></Button>
                    </div>
                </div>
            </div>

            <div
                class="flex flex-col items-center mt-8"
                v-if="data.signin_code"
            >
                <div class="font-bold text-3xl">签到码</div>
                <div class="font-bold text-6xl tracking-widest mt-4">
                    {{ data.signin_code }}
                </div>
            </div>

            <div class="mt-12">
                <div class="overflow-x-auto mb-4">
                    <DataTable :value="SigninList" class="min-w-full">
                        <Column field="uid" header="学号">
                            <template #body="{ data }">
                                <div class="min-w-32">{{ data.uid }}</div>
                            </template>
                        </Column>
                        <Column field="uid" header="姓名">
                            <template #body="{ data }">
                                <div class="min-w-32">{{ data.nick }}</div>
                            </template>
                        </Column>
                        <Column field="uid" header="签到时间">
                            <template #body="{ data }">
                                <div class="min-w-32">
                                    {{
                                        new Date(
                                            data.participation_time * 1000
                                        ).toLocaleString()
                                    }}
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div class="flex justify-end items-center gap-4">
                    <div>
                        <Button
                            type="button"
                            label="导出"
                            size="small"
                            icon="pi pi-download"
                            @click="downloadNameList"
                        ></Button>
                    </div>
                    <Paginator
                        v-model:page="page"
                        v-model:rows="size"
                        :totalRecords="total"
                        :rowsPerPageOptions="[10, 20, 30]"
                    ></Paginator>
                </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
                <Button
                    type="button"
                    label="关闭"
                    @click="visible = false"
                ></Button>
            </div>
    </Dialog>
</template>

<style scoped>
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
