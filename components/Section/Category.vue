<template>
  <div v-if="readMode" class="hidden lg:sticky lg:grid flex-wrap gap-3 lg:top-24">
      <div v-for="(item, key) in results" :key="`c-${key}`">
        <SectionCategoryGroup :item="item"/>
      </div>
  </div>
  <div v-else class="grid gap-5 md:grid-cols-3 md:gap-7">
    <div v-for="(item, key) in results" :key="`head-${key}`"
         class="relative transition-all group border border-outlineVariant overflow-hidden p-5 rounded-3xl"
    >
      <div class="flex items-center gap-5">
        <div
            class="bg-secondaryContainer relative px-4 py-3.5 items-center aspect-square rounded-full text-onSecondaryContainer group-hover:bg-primary group-hover:text-onPrimary"
        >
          <span class="font-semibold leading-tight text-lg" v-text="key >= 9 ? (key+1) : `0${key+1}`"></span>
        </div>
        <div class="grow">
          <h3 class="font-semibold text-xl text-onPrimaryContainer" v-text="item.title"></h3>
        </div>
        <NuxtLink :to="item._path" class="absolute inset-0"/>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">

const {data: navigation} = await useAsyncData('navigation', () => fetchContentNavigation('docs'))
const results = navigation.value[0].children

defineProps<{
  readMode?: boolean
}>()
</script>
