<script setup>
import { useRoute } from 'vue-router'
import Showdown from 'showdown'

const route = useRoute()
const eid = route.params.id

const axios = inject('axios')
const converter = new Showdown.Converter()

const data = ref(null)

axios
    .get('/event/detail', {
        params: {
            eid: eid,
        },
    })
    .then(res => {
        data.value = res.data
    })
</script>

<template>
    <div class="main-part mx-auto py-16">
        <div v-if="data">
            <div class="text-3xl font-bold mb-2">{{ data.title }}</div>
            <div class="flex flex-col gap-x-1 mb-4" v-if="data.tag">
                <div v-for="tag in data.tag.split(' ')" :key="tag">
                    <Tag :value="tag" class="text-nowrap"></Tag>
                </div>
            </div>
            <div>
                发布者:
                {{ data.publisher }}
            </div>
            <div>
                发布时间:
                {{ new Date(data.first_publish * 1000).toLocaleDateString() }}
            </div>

            <div class="text-xl font-bold mt-12 mb-4">基本信息</div>
            <DataTable
                :value="[
                    {
                        start_time: data.start_time,
                        end_time: data.end_time,
                        place: data.place,
                    },
                ]"
            >
                <Column field="start_time" header="开始时间">
                    <template #body="{ data }">
                        {{ new Date(data.start_time * 1000).toLocaleString() }}
                    </template>
                    ></Column
                >
                <Column field="end_time" header="结束时间">
                    <template #body="{ data }">
                        {{ new Date(data.end_time * 1000).toLocaleString() }}
                    </template></Column
                >
                <Column field="place" header="地点"></Column>
            </DataTable>

            <div class="text-xl font-bold mt-12">活动简介</div>
            <div
                class="main-content"
                v-html="converter.makeHtml(data.description)"
            ></div>
        </div>
        <div v-else>
            <Skeleton height="2rem" class="mb-2"></Skeleton>
            <Skeleton height="1rem" width="6rem" class="mb-8"></Skeleton>
            <Skeleton height="1.2rem" class="mb-2"></Skeleton>
            <Skeleton height="1.2rem" class="mb-2"></Skeleton>
            <Skeleton height="1.2rem" class="mb-2"></Skeleton>
            <Skeleton height="1.2rem" class="mb-2"></Skeleton>
        </div>
    </div>
</template>

<style>
.main-content p {
    margin: 2rem 0;
    width: 100%;
}

.main-content img {
    margin: 2rem auto;
    max-width: 40rem;
    max-height: 30rem;
    height: auto;
}
</style>
