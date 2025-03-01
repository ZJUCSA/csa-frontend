<script setup>
import Typed from 'typed.js'

import banner1 from '@/assets/banner1.jpg?url'
import banner2 from '@/assets/banner2.jpg?url'
import banner3 from '@/assets/banner3.jpg?url'

const images = [
    {
        itemImageSrc: banner1,
        alt: 'banner1',
    },
    {
        itemImageSrc: banner2,
        alt: 'banner2',
    },
    {
        itemImageSrc: banner3,
        alt: 'banner3',
    },
]

onMounted(() => {
    new Typed('#typing', {
        strings: [
            '探索网络空间的无限可能',
            '筑牢网络国度的数字防线',
            '守护网络世界的和谐安宁',
        ],
        typeSpeed: 80,
        loop: true,
    })
})
</script>

<template>
    <div
        class="absolute text-white z-10 text-center w-full mt-[8rem]"
        id="home"
    >
        <p class="text-2xl mb-1">欢迎来到</p>
        <p class="text-2xl mb-10 font-bold">浙江大学学生网络空间安全协会</p>
        <div class="text-6xl font-bold mx-2">
            <span id="typing"></span>
        </div>
    </div>
    <Carousel
        :value="images"
        :numVisible="1"
        :numScroll="1"
        circular
        :showNavigators="false"
        :autoplayInterval="2100"
    >
        <template #item="slotProps">
            <img
                :src="slotProps.data.itemImageSrc"
                :alt="slotProps.data.alt"
                class="object-cover"
                style="width: 100%; display: block; height: 30rem"
            />
        </template>
    </Carousel>
</template>

<style>
#home-banner {
    --p-galleria-border-width: 0;
}
</style>
