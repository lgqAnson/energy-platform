import { getMockSolarDeviceList } from './src/mocks/providers/energyStorage'

interface DeviceItem {
  name: string; type: string; station: string; ratedPower: string; status: string; installDate: string
}

function useApiData<T>(mockData: T | (() => T), apiFetcher: () => Promise<T>) {}

useApiData<DeviceItem[]>(
  getMockSolarDeviceList,
  async () => []
)
