<template>
  <div v-if="!embedded" class="module-tabs">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="relative flex items-center justify-center tab-item"
      :class="{ active: route.path === tab.path }"
    >
      <img
        :src="tabBg"
        class="absolute inset-0 w-full h-full object-fill tab-bg"
        :style="{ opacity: route.path === tab.path ? 1 : 0.35 }"
        alt=""
      />
      <div
        v-if="route.path === tab.path"
        class="absolute inset-0 border border-[#01CAFE] rounded-[3px]"
      />
      <span
        class="relative z-10 text-[16px] font-medium"
        :class="route.path === tab.path ? 'text-white' : 'text-[#D7D7D7]'"
      >
        {{ tab.name }}
      </span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

interface TabItem {
  name: string
  path: string
}

withDefaults(
  defineProps<{
    tabs: TabItem[]
    embedded?: boolean
    tabBg?: string
  }>(),
  {
    embedded: false,
    tabBg: '/images/储能-可视看板/u3496.png'
  }
)

const route = useRoute()
</script>

<style scoped>
.module-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 500px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.tab-item {
  width: 124px;
  height: 43px;
}
</style>
