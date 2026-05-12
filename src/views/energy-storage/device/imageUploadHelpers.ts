/**
 * 图片上传辅助函数
 *
 * 供各设备/站点表单组件的上传/删除处理器使用。
 * Mock 模式下使用 Blob URL 本地预览，API 模式下调用 deviceTreeApi 上传到服务器。
 */

import { isApiMockMode } from '@/utils/env'
import { deviceTreeApi } from '@/api/api'

/** 上传文件条目（各表单组件内部使用的扩展类型） */
export interface UploadedImageFile {
  name: string
  size: number
  type: string
  url: string
  key: string
}

/**
 * 上传图片文件并返回条目对象
 *
 * Mock 模式：使用 blob URL 本地预览，key 为空字符串
 * API 模式：调用 deviceTreeApi.uploadImage 获取服务端 URL 和 key
 *
 * @param file 用户选择的图片文件
 * @returns 包含 name/size/type/url/key 的条目对象
 */
export const createImageEntry = async (file: File): Promise<UploadedImageFile> => {
  const entry: UploadedImageFile = {
    name: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file),
    key: ''
  }

  if (!isApiMockMode) {
    try {
      const res = await deviceTreeApi.uploadImage(file)
      entry.url = res.data.url
      entry.key = res.data.key
    } catch {
      // API 模式上传失败时保留 blob URL 兜底
    }
  }

  return entry
}

/**
 * 清理图片条目（释放 Blob URL 并在 API 模式下删除服务端文件）
 *
 * @param file 待清理的图片条目
 */
export const removeImageEntry = (file: UploadedImageFile) => {
  if (file.key) {
    deviceTreeApi.deleteImage(file.key).catch(() => {})
  }
  if (file.url && file.url.startsWith('blob:')) {
    URL.revokeObjectURL(file.url)
  }
}

/** 图片上传支持的 MIME 类型 */
export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

/** 图片上传大小上限（100MB） */
export const MAX_IMAGE_SIZE = 100 * 1024 * 1024
