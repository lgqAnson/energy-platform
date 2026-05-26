<template>
  <div class="panel station-panel">
    <!-- <div class="panel-header-bar">
      <img src='' class="header-bg" alt="" />
      <span class="header-title">电站规模及运行概况</span>
    </div> -->
    <div class="panel-body">
      <div class="panel-inner station-inner">
        <div class="station-content">
          <!-- 第一行：装机容量 + 装机功率 -->
          <div class="stats-row">
            <div class="stat-item-left stat-left">
              <div class="stat-item-label-left">
                <span class="stat-bar" />
                {{ topStats[0].label }}
              </div>
              <div class="stat-item-value">
                <img src="/icons/img-capacity@2x.png" class="stat-icon-left" alt="" />
                <span class="stat-num">{{ formatNumber(topStats[0].value) }}</span>
                <span class="stat-unit">{{ topStats[0].unit }}</span>
              </div>
            </div>
            <div class="stat-item-right stat-right">
              <div class="stat-item-label-right">
                {{ topStats[1].label }}
                <span class="stat-bar" />
              </div>
              <div class="stat-item-value">
                <span class="stat-unit">{{ topStats[1].unit }}</span>
                <span class="stat-num">{{ formatNumber(topStats[1].value) }}</span>
                <img src="/icons/img-power@2x.png" class="stat-icon-right" alt="" />
              </div>
            </div>
          </div>

          <!-- 第二行：累计总充电量 + 累计总放电量 -->
          <div class="stats-row">
            <div class="stat-item-left stat-left">
              <div class="stat-item-label-left">
                <span class="stat-bar" />
                {{ topStats[2].label }}
              </div>
              <div class="stat-item-value">
                <img src="/icons/img-charge-amount@2x.png" class="stat-icon-left" alt="" />
                <span class="stat-num">{{ formatNumber(topStats[2].value) }}</span>
                <span class="stat-unit">{{ topStats[2].unit }}</span>
              </div>
              <div class="stat-sub-label">历史累计充电总量</div>
            </div>
            <div class="stat-item-right stat-right">
              <div class="stat-item-label-right">
                {{ topStats[3].label }}
                <span class="stat-bar" />
              </div>
              <div class="stat-item-value">
                <span class="stat-unit">{{ topStats[3].unit }}</span>
                <span class="stat-num">{{ formatNumber(topStats[3].value) }}</span>
                <img src="/icons/img-discharge-amount@2x.png" class="stat-icon-right" alt="" />
              </div>
            </div>
          </div>

          <!-- 中间大圆环 -->
          <div class="center-ring">
            <div class="ring-visual">
              <img src="/images/stationPreview@2x.png" class="ring-bg" alt="" />
              <div class="ring-content">
                <div class="ring-value">{{ formatNumber(safeDays) }}</div>
                <div class="ring-tag">无重大安全事故发生</div>
              </div>
            </div>
            <div class="ring-label">安全运行天数 / 天</div>
          </div>

          <!-- 底部：总电站数 + 总储能柜数 -->
          <div class="stats-row bottom-row">
            <div class="stat-item-left stat-left">
              <div class="stat-item-label-left">
                <span class="stat-bar" />
                总电站数
              </div>
              <div class="stat-item-value">
                <img src="/icons/img-power-station@2x.png" class="stat-icon-left" alt="" />
                <span class="stat-num">{{ formatNumber(topStats[4].value)}}</span>
                <span class="stat-unit">{{ topStats[4].unit  }}</span>
              </div>
            </div>
            <div class="stat-item-right stat-right">
              <div class="stat-item-label-right">
                总储能柜数
                <span class="stat-bar" />
              </div>
              <div class="stat-item-value">
                <span class="stat-unit">{{ topStats[5].unit  }}</span>
                <span class="stat-num">{{ formatNumber(topStats[5].value) }}</span>
                <img src="/icons/img-energy-storage@2x.png" class="stat-icon-right" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { energyStorageApi } from '@/api/api'

/** 安全运行天数（天） */
const safeDays = ref(1250)

/** 顶部统计指标数据 */
const topStats = ref([
  { label: '装机容量', value: 15280, unit: 'kwh' },
  { label: '装机功率', value: 15280, unit: 'kW' },
  { label: '累计总充电量', value: 85600, unit: 'kwh' },
  { label: '累计总放电量', value: 15280, unit: 'kwh' },
  { label: '总电站数', value: 328, unit: '座' },
  { label: '总储能柜数', value: 1850, unit: '台' }
])
/**
 * 格式化数字为千分位显示格式
 * @param num 待格式化的数值
 * @returns 带千分位分隔符的字符串
 */
const formatNumber = (num: number) => num.toLocaleString('zh-CN')

/**
 * 组件挂载后获取仪表盘数据
 */
onMounted(() => {
  // energyStorageApi.getDashboardData().then((res) => {
  //   console.log(res)
  // })
})


</script>

<style scoped>
.panel {
  background: linear-gradient(180deg, rgba(22, 43, 131, 0) 0%, rgba(22, 43, 131, 0.15) 100%);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}
/* .panel::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
} */
.station-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.panel-header-bar {
  position: relative;
  height: 24px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.header-bg {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 200px;
  object-fit: fill;
}
.header-title {
  position: relative;
  z-index: 10;
  font-size: 16px;
  font-weight: 700;
  padding-left: 12px;
  padding-right: 12px;
  font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif;
  color: #02A7F0;
  line-height: 23px;
}
.station-panel .panel-body {
  flex: 1;
  min-height: 0;
  position: relative;
}
.station-inner {
  position: relative;
  padding: 6px 8px;
  height: 100%;
}
.station-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
}
.station-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 10px;
  justify-content: space-between;
}

/* 指标行 */
.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  flex-shrink: 0;
}
.stat-item-left {
  background: linear-gradient(145deg, rgba(18, 34, 58, 0.6) 0%, rgba(10, 22, 40, 0.6) 100%);
  box-shadow: 10px 17px 24px 0px rgba(0,0,0,0.1);
border-radius: 0px 0px 0px 0px;
border: 1px solid;
border-image: linear-gradient(270deg, rgba(131, 151, 202, 0), rgba(131, 151, 202, 1)) 1 1;
  padding: 21px 10px;
}
.stat-item-right {
  background: linear-gradient(145deg, rgba(18, 34, 58, 0.6) 0%, rgba(10, 22, 40, 0.6) 100%);
 box-shadow: 10px 17px 24px 0px rgba(0,0,0,0.1);
border-radius: 0px 0px 0px 0px;
border: 1px solid;
border-image: linear-gradient(90deg, rgba(131, 151, 202, 0), rgba(131, 151, 202, 1)) 1 1;
  padding: 21px 10px;
}
.stat-item-label-left {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  background: linear-gradient( 90deg, rgba(69,131,255,0.2) 0%, rgba(69,131,255,0) 100%);
  margin-bottom: 4px;
}
.stat-item-label-right {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  background: linear-gradient( 90deg, rgba(69,131,255,0) 0%, rgba(69,131,255,0.2) 100%);
  margin-bottom: 4px;
}
.stat-bar {
  display: inline-block;
  width: 3px;
  height: 12px;
  background: #02A7F0;
  border-radius: 2px;
}
.stat-item-value {
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}
.stat-icon-left,
.stat-icon-right {
  width: 16px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
}
.stat-num {
  font-size: 18px;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.2;
}
.stat-unit {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
}
.stat-sub-label {
  font-size: 10px;
  color: #4583FF;
  margin-top: 2px;
}

/* 左侧指标：标签左对齐，数值左对齐 */
.stat-left .stat-item-label { justify-content: flex-start; }
.stat-left .stat-item-value  { justify-content: flex-start; }

/* 右侧指标：标签右对齐，数值右对齐 */
.stat-right .stat-item-label { justify-content: flex-end; }
.stat-right .stat-item-value  { justify-content: flex-end; }

/* 中间大圆环 - 绝对定位在正中间，不占用布局 */
.center-ring {
  position: absolute;
  top: 48%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 220px;
  height: 180px;
  pointer-events: none;
}
.ring-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.ring-content {
  position: absolute;
    top: 34px;
    left: 60px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.ring-value {
  font-size: 36px;
  font-weight: 700;
  color: #FFFFFF;
  text-shadow: 0 0 12px rgba(2, 167, 240, 0.5);
}
.ring-tag {
  margin-left: -30px;
  font-size: 12px;
  color: #ffffff;
  background: #00A4A9;
  border: 1px solid rgba(2, 167, 240, 0.3);
  border-radius: 10px;
  padding: 2px 10px;
  white-space: nowrap;
}
.ring-label {
  position: absolute;
  bottom: -24px;
  z-index: 1;
  font-size: 12px;
  color: #EBEDF0;
  margin-top: 8px;
}

/* 底部指标 */
.bottom-row {
  padding-bottom: 4px;
}
</style>
