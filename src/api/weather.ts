/**
 * 天气服务对接模块
 *
 * 默认使用 Open-Meteo 免费天气 API（无需 Key，国内可访问）。
 * 如需接入和风天气等商业服务，可在此模块内扩展并传入 VITE_WEATHER_API_KEY。
 */

import axios from 'axios'
import { isApiMockMode } from '@/utils/env'
import { getMockWeatherData } from '@/mocks/providers/energyStorage'

// ============================================================
// 类型定义
// ============================================================

/** 天气信息 */
export interface WeatherInfo {
  /** 城市名称 */
  city: string
  /** 当前温度（°C） */
  temperature: number
  /** 天气状况描述 */
  description: string
  /** 今日最高温度（°C） */
  maxTemp: number
  /** 今日最低温度（°C） */
  minTemp: number
  /** 天气图标代码（对应 WMO Weather interpretation codes） */
  weatherCode: number
}

// ============================================================
// 城市坐标映射（常用城市）
// ============================================================

const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
  广州: { latitude: 23.1291, longitude: 113.2644 },
  深圳: { latitude: 22.5431, longitude: 114.0579 },
  北京: { latitude: 39.9042, longitude: 116.4074 },
  上海: { latitude: 31.2304, longitude: 121.4737 },
  杭州: { latitude: 30.2741, longitude: 120.1551 },
  成都: { latitude: 30.5728, longitude: 104.0668 },
  武汉: { latitude: 30.5928, longitude: 114.3055 },
  西安: { latitude: 34.3416, longitude: 108.9398 }
}

/** 默认城市 */
const DEFAULT_CITY = import.meta.env.VITE_WEATHER_CITY || '广州'

// ============================================================
// WMO 天气代码映射表
// ============================================================

/**
 * 将 WMO Weather interpretation code 转为中文描述
 * @param code WMO 天气代码
 * @returns 中文天气描述
 */
export function getWeatherDescription(code: number): string {
  const map: Record<number, string> = {
    0: '晴',
    1: ' mainly clear',
    2: '多云',
    3: '阴天',
    45: '雾',
    48: '雾凇',
    51: '毛毛雨',
    53: '中度毛毛雨',
    55: '强毛毛雨',
    56: '冻毛毛雨',
    57: '强冻毛毛雨',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    66: '冻雨',
    67: '强冻雨',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    77: '雪粒',
    80: '阵雨',
    81: '强阵雨',
    82: '暴雨',
    85: '阵雪',
    86: '强阵雪',
    95: '雷雨',
    96: '雷雨伴冰雹',
    99: '强雷雨伴冰雹'
  }
  return map[code] || '未知天气'
}

// ============================================================
// API 调用
// ============================================================

/**
 * 查询指定城市的实时天气
 * @param city 城市名称，默认从环境变量读取
 * @returns 天气信息
 */
export async function fetchWeather(city: string = DEFAULT_CITY): Promise<WeatherInfo> {
  if (isApiMockMode) {
    return getMockWeatherData(city)
  }

  const coord = cityCoordinates[city]
  if (!coord) {
    throw new Error(`暂不支持查询城市：${city}，请在 cityCoordinates 中添加该城市坐标`)
  }

  const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: coord.latitude,
      longitude: coord.longitude,
      current: 'temperature_2m,weather_code',
      daily: 'temperature_2m_max,temperature_2m_min',
      timezone: 'auto',
      forecast_days: 1
    },
    timeout: 10000
  })

  const current = data.current
  const daily = data.daily

  return {
    city,
    temperature: Math.round(current.temperature_2m),
    description: getWeatherDescription(current.weather_code),
    maxTemp: Math.round(daily.temperature_2m_max[0]),
    minTemp: Math.round(daily.temperature_2m_min[0]),
    weatherCode: current.weather_code
  }
}

/**
 * 判断是否需要触发高温预警
 * @param maxTemp 今日最高温度
 * @param threshold 预警阈值（默认 35°C）
 * @returns 是否触发高温预警
 */
export function isHighTempAlert(maxTemp: number, threshold: number = 35): boolean {
  return maxTemp >= threshold
}
