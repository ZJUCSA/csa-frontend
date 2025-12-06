<script setup>
import { newsCategory } from '@/const'
import { processMarkdownImages, processImageUrl } from '@/utils/imageUtils'

const axios = inject('axios')

const props = defineProps(['show', 'nid'])
const emits = defineEmits(['update:show', 'finish'])

const loading = ref(false)
const rendering = ref(true)

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

const visible = computed({
    get() {
        return props.show
    },
    set(value) {
        emits('update:show', value)
    },
})

const data = reactive({
    content: '',
    title: '',
    tag: '',
    category: 1,
    image: '',
})

const uploadFile = ref(null)
const isUploading = ref(false)
const uploadMode = ref(false)

// Local state for draft handling
const draftNid = ref(null)
const saved = ref(false)

const cateOptions = newsCategory.slice(1).map((item, index) => {
    return {
        label: item,
        value: index + 1,
    }
})

const submit = () => {
    axios
        .post('/edit/news', {
            nid: props.nid || draftNid.value,
            title: data.title,
            content: data.content,
            tag: data.tag,
            category: data.category,
            image: data.image,
        })
        .then(() => {
            saved.value = true // Mark as saved so we don't delete it
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
    const formData = new FormData()
    formData.append('file', uploadFile.value)
    formData.append('type', 'news')
    // Send nid if available (for draft or edit)
    const currentNid = props.nid || draftNid.value
    if (currentNid) {
        formData.append('nid', currentNid)
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
                data.content = processMarkdownImages(res.data.content || data.content)
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

watch(visible, value => {
    if (value) {
        if (props.nid) {
            loading.value = true
            axios
                .get('/news/detail', {
                    params: {
                        nid: props.nid,
                    },
                })
                .then(res => {
                    data.title = res.data.title
                    data.content = processMarkdownImages(res.data.content)
                    data.tag = res.data.tag
                    data.category = res.data.category
                    data.image = processImageUrl(res.data.image)
                    loading.value = false
                })
        } else {
            // Create a draft first to get nid
            loading.value = true
            axios.post('/create/news/draft')
                .then(res => {
                    draftNid.value = res.data.nid
                    
                    data.title = ''
                    data.content = ''
                    data.tag = ''
                    data.category = 1
                    data.image = ''
                    loading.value = false
                })
                .catch(err => {
                    window.notyf.error('无法创建草稿: ' + err.message)
                    visible.value = false
                })
        }
    } else {
        // If closed without saving, and we have a draftNid, we should delete it?
        // But user might just have clicked outside.
        // If we want "Cancel" to delete, we need to handle "Cancel" button or close event.
        // But the Dialog just has a close button.
        
        // If we have a draftNid and we are closing NOT because of success submit...
        // But 'visible' changes to false on submit success too.
        
        // Let's add a `saved` flag.
        if (draftNid.value && !saved.value) {
             axios.post('/delete/news', { nid: draftNid.value })
             draftNid.value = null
        }
        saved.value = false
    }
})
</script>

<template>
    <div class="card flex justify-center">
        <Dialog
            v-model:visible="visible"
            modal
            header="创建/编辑新闻"
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
                    <InputText
                        id="username"
                        class="flex-auto"
                        placeholder="标题"
                        autocomplete="off"
                        v-model="data.title"
                    />
                </div>

                <div class="flex flex-col gap-4 mb-4">
                    <vue-vditor
                        v-model="data.content"
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
                    <label>标签</label>
                    <InputText
                        id="tag"
                        class="flex-auto"
                        placeholder="标签"
                        autocomplete="off"
                        v-model="data.tag"
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
