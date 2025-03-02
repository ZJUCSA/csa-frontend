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
    <div class="card flex justify-center">
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
                <DataTable :value="SigninList" class="mb-4">
                    <Column field="uid" header="学号">
                        <template #body="{ data }">
                            <div class="min-w-48">{{ data.uid }}</div>
                        </template>
                    </Column>
                    <Column field="uid" header="学号">
                        <template #body="{ data }">
                            <div class="min-w-48">{{ data.nick }}</div>
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

            <div class="flex justify-end gap-2 mt-6">
                <Button
                    type="button"
                    label="关闭"
                    @click="visible = false"
                ></Button>
            </div>
        </Dialog>
    </div>
</template>
