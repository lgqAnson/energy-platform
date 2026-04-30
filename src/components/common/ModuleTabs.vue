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
  margin-bottom: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
  overflow-x: auto;
}

.tab-item {
  width: 124px;
  height: 43px;
  flex-shrink: 0;
}

/* Tablet: smaller tabs */
@media (max-width: 1199px) {
  .tab-item {
    width: 100px;
    height: 36px;
  }
  .tab-item span {
    font-size: 13px !important;
  }
}

/* Mobile: even smaller tabs */
@media (max-width: 767px) {
  .tab-item {
    width: 80px;
    height: 32px;
  }
  .tab-item span {
    font-size: 11px !important;
  }
}
</style>
