<script setup>
import { newsCategory } from '@/const'

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

const cateOptions = newsCategory.slice(1).map((item, index) => {
    return {
        label: item,
        value: index + 1,
    }
})

const submit = () => {
    axios
        .post('/edit/news', {
            nid: props.nid,
            title: data.title,
            content: data.content,
            tag: data.tag,
            category: data.category,
            image: data.image,
        })
        .then(() => {
            visible.value = false
            window.notyf.success('操作成功')
            emits('finish')
        })
}

watch(visible, value => {
    if (value && props.nid) {
        loading.value = true
        axios
            .get('/news/detail', {
                params: {
                    nid: props.nid,
                },
            })
            .then(res => {
                data.title = res.data.title
                data.content = res.data.content
                data.tag = res.data.tag
                data.category = res.data.category
                data.image = res.data.image
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
            header="创建/编辑新闻"
            :style="{ width: '50rem' }"
        >
            <div class="mx-8" v-if="!loading">
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
