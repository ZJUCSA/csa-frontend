<script setup>
import { useRoute } from 'vue-router'
import Showdown from 'showdown'

const route = useRoute()
const nid = route.params.id

const axios = inject('axios')
const converter = new Showdown.Converter()

const data = ref(null)

axios
    .get('/news/detail', {
        params: {
            nid: nid,
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
            <div class="flex flex-col gap-x-1 mb-3" v-if="data.tag">
                <div v-for="tag in data.tag.split(' ')" :key="tag">
                    <Tag :value="tag" class="text-nowrap"></Tag>
                </div>
            </div>
            <div>
                {{ data.publisher }}
            </div>
            <div class="mb-6">
                {{ new Date(data.first_publish * 1000).toLocaleDateString() }}
            </div>

            <div
                class="main-content"
                v-html="converter.makeHtml(data.content)"
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
    width: 100%;
}
</style>
