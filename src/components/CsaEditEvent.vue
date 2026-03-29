<script setup>
import CsaVditor from '@/components/CsaVditor.vue'
import { eventCategory } from '@/const'
import { processMarkdownImages, processImageUrl } from '@/utils/imageUtils'

const axios = inject('axios')

const props = defineProps(['show', 'eid'])
const emits = defineEmits(['update:show', 'finish'])

const loading = ref(false)
const rendering = ref(true)
const draftEid = ref(null)
const saved = ref(false)

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
    cdn: 'https://cdn.jsdelivr.net/npm/vditor@3.10.9',
}

const data = reactive({
    title: '',
    description: '',
    start_time: 0,
    end_time: 0,
    start_signup_time: 0,
    end_signup_time: 0,
    category: 1,
    place: '',
    tag: '',
    image: '',
})

const uploadFile = ref(null)
const isUploading = ref(false)
const uploadMode = ref(false)

const submit = () => {
    const currentEid = props.eid || draftEid.value
    axios
        .post('/edit/event', {
            eid: currentEid,
            title: data.title,
            description: data.description,
            start_time: Date.parse(data.start_time) / 1000,
            end_time: Date.parse(data.end_time) / 1000,
            start_signup_time: Date.parse(data.start_signup_time) / 1000,
            end_signup_time: Date.parse(data.end_signup_time) / 1000,
            category: data.category,
            place: data.place,
            tag: data.tag,
            image: data.image,
        })
        .then(() => {
            saved.value = true
            visible.value = false
            window.notyf.success('操作成功')
            emits('finish')
        })
}

const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    if (!file.name.endsWith('.zip') && !file.name.endsWith('.rar')) {
        window.notyf.error('请上传zip或rar格式的压缩包')
        return
    }
    
    uploadFile.value = file
}

const uploadAndParse = () => {
    if (!uploadFile.value) {
        window.notyf.error('请先选择文件')
        return
    }
    
    isUploading.value = true
    const currentEid = props.eid || draftEid.value
    const formData = new FormData()
    formData.append('file', uploadFile.value)
    formData.append('type', 'event')
    if (currentEid) {
        formData.append('eid', currentEid)
    }
    
    axios
        .post('/upload/parse', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(res => {
            if (res.data.success) {
                data.title = res.data.title || data.title
                data.description = processMarkdownImages(res.data.content || data.description)
                data.image = processImageUrl(res.data.image || data.image)
                window.notyf.success('文件解析成功')
                uploadMode.value = false
                uploadFile.value = null
            } else {
                window.notyf.error(res.data.message || '文件解析失败')
            }
        })
        .catch(error => {
            window.notyf.error('上传失败: ' + (error.response?.data?.detail || error.message))
        })
        .finally(() => {
            isUploading.value = false
        })
}

const cateOptions = eventCategory.slice(1).map((item, index) => {
    return {
        label: item,
        value: index + 1,
    }
})

watch(visible, value => {
    if (value) {
        saved.value = false
        if (props.eid) {
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
                    data.description = processMarkdownImages(res.data.description)
                    data.start_time = new Date(res.data.start_time * 1000)
                    data.end_time = new Date(res.data.end_time * 1000)
                    data.start_signup_time = new Date(
                        res.data.start_signup_time * 1000
                    )
                    data.end_signup_time = new Date(
                        res.data.end_signup_time * 1000
                    )
                    data.category = res.data.category
                    data.place = res.data.place
                    data.tag = res.data.tag
                    data.image = processImageUrl(res.data.image)
                    loading.value = false
                })
        } else {
            axios.post('/create/event/draft').then(res => {
                draftEid.value = res.data.eid
            })
            data.title = ''
            data.description = ''
            data.start_time = 0
            data.end_time = 0
            data.start_signup_time = 0
            data.end_signup_time = 0
            data.category = 1
            data.place = ''
            data.tag = ''
            data.image = ''
        }
    } else {
        if (draftEid.value && !saved.value) {
            axios.post('/delete/event', { eid: draftEid.value })
        }
        draftEid.value = null
    }
})
</script>

<template>
    <Dialog
            v-model:visible="visible"
            modal
            header="创建/编辑活动"
            :style="{ width: '50rem' }"
        >
            <div class="mx-8" v-if="!loading">
                <!-- 上传模式切换 -->
                <div class="flex items-center gap-4 mb-4">
                    <Button
                        :label="uploadMode ? '手动编辑' : '上传压缩包'"
                        :icon="uploadMode ? 'pi pi-pencil' : 'pi pi-upload'"
                        severity="info"
                        size="small"
                        @click="uploadMode = !uploadMode"
                    />
                    <span class="text-sm text-gray-600">
                        {{ uploadMode ? '上传包含xx.md和img/文件夹的压缩包' : '手动输入内容' }}
                    </span>
                </div>

                <!-- 上传区域 -->
                <div v-if="uploadMode" class="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <div class="text-center">
                        <input
                            type="file"
                            ref="fileInput"
                            @change="handleFileUpload"
                            accept=".zip,.rar"
                            class="hidden"
                        />
                        <Button
                            label="选择压缩包"
                            icon="pi pi-upload"
                            @click="$refs.fileInput.click()"
                            class="mb-2"
                        />
                        <div v-if="uploadFile" class="text-sm text-green-600 mb-2">
                            已选择: {{ uploadFile.name }}
                        </div>
                        <Button
                            label="解析上传"
                            icon="pi pi-check"
                            :loading="isUploading"
                            :disabled="!uploadFile"
                            @click="uploadAndParse"
                        />
                    </div>
                </div>

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
                    <CsaVditor
                        v-model="data.description"
                        :options="options"
                        class="editor"
                        @after="rendering = false"
                    ></CsaVditor>
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
                        <label>活动开始时间</label>
                        <DatePicker
                            showTime
                            hourFormat="24"
                            fluid
                            dateFormat="yy-mm-dd"
                            v-model="data.start_time"
                        />
                    </div>

                    <div class="flex items-center gap-4 mb-4">
                        <label>活动结束时间</label>
                        <DatePicker
                            showTime
                            hourFormat="24"
                            fluid
                            dateFormat="yy-mm-dd"
                            v-model="data.end_time"
                        />
                    </div>
                </div>
                <div class="flex gap-x-8">
                    <div class="flex items-center gap-4 mb-4">
                        <label>开始报名时间</label>
                        <DatePicker
                            showTime
                            hourFormat="24"
                            fluid
                            dateFormat="yy-mm-dd"
                            v-model="data.start_signup_time"
                        />
                    </div>

                    <div class="flex items-center gap-4 mb-4">
                        <label>结束报名时间</label>
                        <DatePicker
                            showTime
                            hourFormat="24"
                            fluid
                            dateFormat="yy-mm-dd"
                            v-model="data.end_signup_time"
                        />
                    </div>
                </div>

                <div class="flex items-center gap-4 mb-4">
                    <label>分类</label>
                    <Select
                        v-model="data.category"
                        optionLabel="label"
                        optionValue="value"
                        :options="cateOptions"
                    ></Select>
                </div>

                <div class="flex items-center gap-4 mb-4">
                    <label>头图</label>
                    <InputText
                        id="image"
                        class="flex-auto"
                        placeholder="头图 URL"
                        autocomplete="off"
                        v-model="data.image"
                    />
                </div>

                <div class="flex items-center gap-4 mb-4">
                    <label>地点</label>
                    <InputText
                        id="place"
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
</template>
