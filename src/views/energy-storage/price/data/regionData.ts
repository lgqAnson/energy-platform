/**
 * 地区电价数据
 *
 * 提供省/市/区三级地区级联选择器的选项树和每个地区的独立电价、
 * 时段配置及数据更新时间，用于电价管理模块的地区联动数据切换。
 */

/** 级联选择器节点 */
export interface RegionNode {
  value: string
  label: string
  children?: RegionNode[]
}

/** 充放电电价条目 */
export interface PriceEntry {
  charge: number
  discharge: number
}

/** 尖/峰/平/谷四个时段的电价映射 */
export interface PriceMap {
  sharp: PriceEntry
  peak: PriceEntry
  flat: PriceEntry
  valley: PriceEntry
}

/** 时段配置 */
export interface TimeSlot {
  key: string
  name: string
  range: string
  tag: string
  tagBg: string
  tagColor: string
}

/** 地区完整信息：电价 + 时段 + 数据更新时间 */
export interface RegionInfo {
  prices: PriceMap
  timeSlots: TimeSlot[]
  updatedAt: string
}

/** 级联选择器 — 省市区三级选项树，覆盖广东/浙江/江苏三省共 17 个区县 */
export const regionOptions: RegionNode[] = [
  {
    value: 'guangdong',
    label: '广东省',
    children: [
      {
        value: 'guangzhou',
        label: '广州市',
        children: [
          { value: 'huangpu', label: '黄埔区' },
          { value: 'tianhe', label: '天河区' },
          { value: 'yuexiu', label: '越秀区' }
        ]
      },
      {
        value: 'shenzhen',
        label: '深圳市',
        children: [
          { value: 'nanshan', label: '南山区' },
          { value: 'baoan', label: '宝安区' },
          { value: 'futian', label: '福田区' }
        ]
      },
      {
        value: 'dongguan',
        label: '东莞市',
        children: [
          { value: 'changan', label: '长安镇' },
          { value: 'humen', label: '虎门镇' }
        ]
      }
    ]
  },
  {
    value: 'zhejiang',
    label: '浙江省',
    children: [
      {
        value: 'hangzhou',
        label: '杭州市',
        children: [
          { value: 'xihu', label: '西湖区' },
          { value: 'yuhang', label: '余杭区' }
        ]
      },
      {
        value: 'ningbo',
        label: '宁波市',
        children: [
          { value: 'haishu', label: '海曙区' },
          { value: 'yinzhou', label: '鄞州区' }
        ]
      }
    ]
  },
  {
    value: 'jiangsu',
    label: '江苏省',
    children: [
      {
        value: 'nanjing',
        label: '南京市',
        children: [
          { value: 'jiangning', label: '江宁区' },
          { value: 'gulou', label: '鼓楼区' }
        ]
      },
      {
        value: 'suzhou',
        label: '苏州市',
        children: [
          { value: 'gongyeyuan', label: '工业园区' },
          { value: 'huqiu', label: '虎丘区' }
        ]
      }
    ]
  }
]

/**
 * 构建地区路径 → 电价数据的映射表
 * 每个地区（省/市/区）配有独立的尖/峰/平/谷电价、时段范围和更新时间
 * @returns 地区路径到电价信息的完整映射
 */
const buildRegionMap = (): Record<string, RegionInfo> => {
  const map: Record<string, RegionInfo> = {}

  const add = (path: string, prices: PriceMap, timeSlots: TimeSlot[], updatedAt: string) => {
    map[path] = { prices, timeSlots, updatedAt }
  }

  const defaultSlots: TimeSlot[] = [
    { key: 'sharp', name: '尖时段', range: '11:00 - 12:00', tag: '尖峰', tagBg: 'rgba(255, 107, 53, 0.2)', tagColor: '#FF6B35' },
    { key: 'peak', name: '峰时段', range: '10:00 - 11:00, 14:00 - 19:00', tag: '高峰', tagBg: 'rgba(255, 77, 77, 0.2)', tagColor: '#FF4D4D' },
    { key: 'flat', name: '平时段', range: '08:00 - 10:00, 12:00 - 14:00, 19:00 - 23:59', tag: '平常', tagBg: 'rgba(74, 158, 255, 0.2)', tagColor: '#4A9EFF' },
    { key: 'valley', name: '谷时段', range: '00:00 - 08:00', tag: '低谷', tagBg: 'rgba(74, 158, 255, 0.2)', tagColor: '#4A9EFF' }
  ]

  // 广东省 - 广州市
  add('广东省/广州市/黄埔区', {
    sharp: { charge: 1.43, discharge: 1.43 },
    peak: { charge: 1.15, discharge: 1.15 },
    flat: { charge: 0.68, discharge: 0.68 },
    valley: { charge: 0.27, discharge: 0.27 }
  }, defaultSlots, '2025-03-12 08:30:22')

  add('广东省/广州市/天河区', {
    sharp: { charge: 1.48, discharge: 1.48 },
    peak: { charge: 1.20, discharge: 1.20 },
    flat: { charge: 0.72, discharge: 0.72 },
    valley: { charge: 0.30, discharge: 0.30 }
  }, [
    { key: 'sharp', name: '尖时段', range: '11:30 - 12:30', tag: '尖峰', tagBg: 'rgba(255, 107, 53, 0.2)', tagColor: '#FF6B35' },
    { key: 'peak', name: '峰时段', range: '09:00 - 11:30, 14:00 - 17:00', tag: '高峰', tagBg: 'rgba(255, 77, 77, 0.2)', tagColor: '#FF4D4D' },
    { key: 'flat', name: '平时段', range: '08:00 - 09:00, 12:30 - 14:00, 17:00 - 23:59', tag: '平常', tagBg: 'rgba(74, 158, 255, 0.2)', tagColor: '#4A9EFF' },
    { key: 'valley', name: '谷时段', range: '00:00 - 08:00', tag: '低谷', tagBg: 'rgba(74, 158, 255, 0.2)', tagColor: '#4A9EFF' }
  ], '2025-03-12 09:15:33')

  add('广东省/广州市/越秀区', {
    sharp: { charge: 1.41, discharge: 1.41 },
    peak: { charge: 1.12, discharge: 1.12 },
    flat: { charge: 0.66, discharge: 0.66 },
    valley: { charge: 0.26, discharge: 0.26 }
  }, defaultSlots, '2025-03-12 07:50:11')

  // 广东省 - 深圳市
  add('广东省/深圳市/南山区', {
    sharp: { charge: 1.52, discharge: 1.52 },
    peak: { charge: 1.22, discharge: 1.22 },
    flat: { charge: 0.73, discharge: 0.73 },
    valley: { charge: 0.32, discharge: 0.32 }
  }, [
    { key: 'sharp', name: '尖时段', range: '10:00 - 12:00, 14:00 - 16:00', tag: '尖峰', tagBg: 'rgba(255, 107, 53, 0.2)', tagColor: '#FF6B35' },
    { key: 'peak', name: '峰时段', range: '09:00 - 10:00, 16:00 - 19:00', tag: '高峰', tagBg: 'rgba(255, 77, 77, 0.2)', tagColor: '#FF4D4D' },
    { key: 'flat', name: '平时段', range: '07:00 - 09:00, 12:00 - 14:00, 19:00 - 23:00', tag: '平常', tagBg: 'rgba(74, 158, 255, 0.2)', tagColor: '#4A9EFF' },
    { key: 'valley', name: '谷时段', range: '23:00 - 07:00', tag: '低谷', tagBg: 'rgba(74, 158, 255, 0.2)', tagColor: '#4A9EFF' }
  ], '2025-03-12 08:45:00')

  add('广东省/深圳市/宝安区', {
    sharp: { charge: 1.50, discharge: 1.50 },
    peak: { charge: 1.20, discharge: 1.20 },
    flat: { charge: 0.71, discharge: 0.71 },
    valley: { charge: 0.30, discharge: 0.30 }
  }, defaultSlots, '2025-03-12 08:20:00')

  add('广东省/深圳市/福田区', {
    sharp: { charge: 1.55, discharge: 1.55 },
    peak: { charge: 1.25, discharge: 1.25 },
    flat: { charge: 0.75, discharge: 0.75 },
    valley: { charge: 0.33, discharge: 0.33 }
  }, defaultSlots, '2025-03-12 09:00:00')

  // 广东省 - 东莞市
  add('广东省/东莞市/长安镇', {
    sharp: { charge: 1.38, discharge: 1.38 },
    peak: { charge: 1.10, discharge: 1.10 },
    flat: { charge: 0.64, discharge: 0.64 },
    valley: { charge: 0.25, discharge: 0.25 }
  }, defaultSlots, '2025-03-12 08:00:00')

  add('广东省/东莞市/虎门镇', {
    sharp: { charge: 1.36, discharge: 1.36 },
    peak: { charge: 1.08, discharge: 1.08 },
    flat: { charge: 0.63, discharge: 0.63 },
    valley: { charge: 0.24, discharge: 0.24 }
  }, defaultSlots, '2025-03-12 07:55:00')

  // 浙江省 - 杭州市
  add('浙江省/杭州市/西湖区', {
    sharp: { charge: 1.35, discharge: 1.35 },
    peak: { charge: 1.08, discharge: 1.08 },
    flat: { charge: 0.62, discharge: 0.62 },
    valley: { charge: 0.25, discharge: 0.25 }
  }, [
    { key: 'sharp', name: '尖时段', range: '12:00 - 13:00, 17:00 - 18:00', tag: '尖峰', tagBg: 'rgba(255, 107, 53, 0.2)', tagColor: '#FF6B35' },
    { key: 'peak', name: '峰时段', range: '10:00 - 12:00, 14:00 - 17:00', tag: '高峰', tagBg: 'rgba(255, 77, 77, 0.2)', tagColor: '#FF4D4D' },
    { key: 'flat', name: '平时段', range: '08:00 - 10:00, 13:00 - 14:00, 18:00 - 22:00', tag: '平常', tagBg: 'rgba(74, 158, 255, 0.2)', tagColor: '#4A9EFF' },
    { key: 'valley', name: '谷时段', range: '22:00 - 08:00', tag: '低谷', tagBg: 'rgba(74, 158, 255, 0.2)', tagColor: '#4A9EFF' }
  ], '2025-03-12 08:10:00')

  add('浙江省/杭州市/余杭区', {
    sharp: { charge: 1.33, discharge: 1.33 },
    peak: { charge: 1.06, discharge: 1.06 },
    flat: { charge: 0.60, discharge: 0.60 },
    valley: { charge: 0.24, discharge: 0.24 }
  }, defaultSlots, '2025-03-12 08:05:00')

  // 浙江省 - 宁波市
  add('浙江省/宁波市/海曙区', {
    sharp: { charge: 1.32, discharge: 1.32 },
    peak: { charge: 1.05, discharge: 1.05 },
    flat: { charge: 0.60, discharge: 0.60 },
    valley: { charge: 0.23, discharge: 0.23 }
  }, defaultSlots, '2025-03-12 08:00:00')

  add('浙江省/宁波市/鄞州区', {
    sharp: { charge: 1.34, discharge: 1.34 },
    peak: { charge: 1.07, discharge: 1.07 },
    flat: { charge: 0.61, discharge: 0.61 },
    valley: { charge: 0.24, discharge: 0.24 }
  }, defaultSlots, '2025-03-12 08:02:00')

  // 江苏省 - 南京市
  add('江苏省/南京市/江宁区', {
    sharp: { charge: 1.40, discharge: 1.40 },
    peak: { charge: 1.12, discharge: 1.12 },
    flat: { charge: 0.65, discharge: 0.65 },
    valley: { charge: 0.26, discharge: 0.26 }
  }, [
    { key: 'sharp', name: '尖时段', range: '10:00 - 11:00, 15:00 - 16:00', tag: '尖峰', tagBg: 'rgba(255, 107, 53, 0.2)', tagColor: '#FF6B35' },
    { key: 'peak', name: '峰时段', range: '09:00 - 10:00, 14:00 - 15:00, 16:00 - 18:00', tag: '高峰', tagBg: 'rgba(255, 77, 77, 0.2)', tagColor: '#FF4D4D' },
    { key: 'flat', name: '平时段', range: '07:00 - 09:00, 11:00 - 14:00, 18:00 - 21:00', tag: '平常', tagBg: 'rgba(74, 158, 255, 0.2)', tagColor: '#4A9EFF' },
    { key: 'valley', name: '谷时段', range: '21:00 - 07:00', tag: '低谷', tagBg: 'rgba(74, 158, 255, 0.2)', tagColor: '#4A9EFF' }
  ], '2025-03-12 08:25:00')

  add('江苏省/南京市/鼓楼区', {
    sharp: { charge: 1.42, discharge: 1.42 },
    peak: { charge: 1.14, discharge: 1.14 },
    flat: { charge: 0.67, discharge: 0.67 },
    valley: { charge: 0.27, discharge: 0.27 }
  }, defaultSlots, '2025-03-12 08:28:00')

  // 江苏省 - 苏州市
  add('江苏省/苏州市/工业园区', {
    sharp: { charge: 1.45, discharge: 1.45 },
    peak: { charge: 1.17, discharge: 1.17 },
    flat: { charge: 0.69, discharge: 0.69 },
    valley: { charge: 0.28, discharge: 0.28 }
  }, [
    { key: 'sharp', name: '尖时段', range: '09:00 - 11:00', tag: '尖峰', tagBg: 'rgba(255, 107, 53, 0.2)', tagColor: '#FF6B35' },
    { key: 'peak', name: '峰时段', range: '08:00 - 09:00, 11:00 - 12:00, 17:00 - 20:00', tag: '高峰', tagBg: 'rgba(255, 77, 77, 0.2)', tagColor: '#FF4D4D' },
    { key: 'flat', name: '平时段', range: '07:00 - 08:00, 12:00 - 17:00, 20:00 - 22:00', tag: '平常', tagBg: 'rgba(74, 158, 255, 0.2)', tagColor: '#4A9EFF' },
    { key: 'valley', name: '谷时段', range: '22:00 - 07:00', tag: '低谷', tagBg: 'rgba(74, 158, 255, 0.2)', tagColor: '#4A9EFF' }
  ], '2025-03-12 08:35:00')

  add('江苏省/苏州市/虎丘区', {
    sharp: { charge: 1.43, discharge: 1.43 },
    peak: { charge: 1.15, discharge: 1.15 },
    flat: { charge: 0.68, discharge: 0.68 },
    valley: { charge: 0.27, discharge: 0.27 }
  }, defaultSlots, '2025-03-12 08:32:00')

  return map
}

/** 地区路径 → 电价数据完整映射表 */
export const regionDataMap = buildRegionMap()

/**
 * 根据地区路径返回可读的地区标签
 * @param path 地区路径（如 "广东省/广州市/黄埔区"）
 * @returns 地区标签字符串
 */
export function getRegionLabel(path: string): string {
  return path
}
