<script setup>
const axios = inject('axios')

const data = ref([])

const page = ref(1)
const total = ref(0)
const size = ref(10)

const fetchContent = () => {
    axios
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

axios
    .get('/news/count')
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
    <div class="main-part mx-auto py-12">
        <div class="text-2xl font-bold">最新动态</div>
        <div class="text-xl mb-6">Latest News</div>
        <DataTable :value="data" class="mb-4">
            <Column field="title" header="标题">
                <template #body="{ data }">
                    <div class="min-w-48">
                        <router-link
                            class="link"
                            :to="{ name: 'news', params: { id: data.nid } }"
                            >{{ data.title }}</router-link
                        >
                    </div>
                </template>
            </Column>
            <Column field="tag" header="标签">
                <template #body="{ data }">
                    <div class="flex flex-col gap-y-1">
                        <div v-for="tag in data.tag.split(' ')" :key="tag">
                            <Tag :value="tag" class="text-nowrap"></Tag>
                        </div>
                    </div>
                </template>
            </Column>
            <Column field="tag" header="发布日期">
                <template #body="{ data }">
                    <div class="flex flex-col gap-y-1">
                        <div>
                            {{
                                new Date(
                                    data.first_publish * 1000
                                ).toLocaleDateString()
                            }}
                        </div>
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
