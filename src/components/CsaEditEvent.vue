<script setup>
const axios = inject('axios')

const props = defineProps(['show', 'eid'])
const emits = defineEmits(['update:show', 'finish'])

const loading = ref(false)
const rendering = ref(false)

const visible = computed({
    get() {
        return props.show
    },
    set(value) {
        emits('update:show', value)
    },
})

const options = {
    height: 500,
    toolbarConfig: {
        pin: true,
    },
    cache: {
        enable: false,
    },
}

const data = reactive({
    title: '',
    description: '',
    start_time: 0,
    end_time: 0,
    place: '',
    tag: '',
})

const submit = () => {
    axios
        .post('/edit/event', {
            eid: props.eid,
            title: data.title,
            description: data.description,
            start_time: Date.parse(data.start_time) / 1000,
            end_time: Date.parse(data.end_time) / 1000,
            place: data.place,
            tag: data.tag,
        })
        .then(() => {
            visible.value = false
            window.notyf.success('操作成功')
            emits('finish')
        })
}

watch(visible, value => {
    if (value && props.eid) {
        loading.value = true
        rendering.value = true
        axios
            .get('/event/detail', {
                params: {
                    eid: props.eid,
                },
            })
            .then(res => {
                data.title = res.data.title
                data.description = res.data.description
                data.start_time = new Date(res.data.start_time * 1000)
                data.end_time = new Date(res.data.end_time * 1000)
                data.place = res.data.place
                data.tag = res.data.tag
                loading.value = false
            })
    }
})
</script>

<template>
    <div class="card flex justify-center">
        <Dialog
            v-model:visible="visible"
            modal
            header="创建/编辑活动"
            :style="{ width: '50rem' }"
        >
            <div class="mx-8" v-if="!loading">
                <div class="flex items-center gap-4 mb-4">
                    <label>标题</label>
                    <InputText
                        id="username"
                        class="flex-auto"
                        placeholder="标题"
                        autocomplete="off"
                        v-model="data.title"
                    />
                </div>

                <div class="flex flex-col gap-4 mb-4">
                    <label>描述</label>
                    <vue-vditor
                        v-model="data.description"
                        :options="options"
                        class="editor"
                        @after="rendering = false"
                    ></vue-vditor>
                    <Skeleton
                        v-if="rendering"
                        width="100%"
                        height="200px"
                    ></Skeleton>
                </div>

                <div class="flex items-center gap-4 mb-4">
                    <label>标签</label>
                    <InputText
                        id="tag"
                        class="flex-auto"
                        placeholder="标签"
                        autocomplete="off"
                        v-model="data.tag"
                    />
                </div>
                <div class="flex gap-x-8">
                    <div class="flex items-center gap-4 mb-4">
                        <label>开始时间</label>
                        <DatePicker
                            showTime
                            hourFormat="24"
                            fluid
                            dateFormat="yy-mm-dd"
                            v-model="data.start_time"
                        />
                    </div>

                    <div class="flex items-center gap-4 mb-4">
                        <label>结束时间</label>
                        <DatePicker
                            showTime
                            hourFormat="24"
                            fluid
                            dateFormat="yy-mm-dd"
                            v-model="data.end_time"
                        />
                    </div>
                </div>

                <div class="flex items-center gap-4 mb-4">
                    <label>地点</label>
                    <InputText
                        id="tag"
                        class="flex-auto"
                        placeholder="地点"
                        autocomplete="off"
                        v-model="data.place"
                    />
                </div>
            </div>
            <Skeleton v-else width="100%" height="300px"></Skeleton>

            <div class="flex justify-end gap-2 mt-6">
                <Button
                    type="button"
                    label="取消"
                    severity="secondary"
                    @click="visible = false"
                ></Button>
                <Button type="button" label="保存" @click="submit"></Button>
            </div>
        </Dialog>
    </div>
</template>
