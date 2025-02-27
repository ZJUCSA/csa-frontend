<template>
    <div class="banner-area">
        <CsaBanner />
    </div>
    <div class="w-[80vw] mx-auto">
        <div class="flex flex-col md:flex-row gap-x-10 mt-10">
            <csa-news-home class="basis-1/2"></csa-news-home>
            <csa-event-home class="basis-1/2"></csa-event-home>
        </div>
        <div class="flex flex-col md:flex-row gap-x-10 mt-10">
            <csa-info-home></csa-info-home>
        </div>
    </div>
</template>
