<template>
  <div
    class="relative rounded-xl overflow-hidden"
    :style="{
      background: 'linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%)',
      boxShadow: '7px 5px 2.5px rgba(36, 71, 102, 0.6)'
    }"
  >
    <div v-if="title" class="flex items-center gap-2 px-5 pt-4 pb-2">
      <img v-if="icon" :src="icon" class="w-5 h-5" alt="" />
      <h3 class="text-lg font-bold text-primary">{{ title }}</h3>
    </div>
    <div class="p-5">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  icon?: string
}>()
</script>
