import type * as ImageGenerationRecords from "./type"
import { resolveCosImageUrl } from "@/common/constants/image"
import { request } from "@/http/axios"

/** 查询生图记录 */
export function getImageGenerationRecordsApi(params: ImageGenerationRecords.ImageGenerationRecordListRequestData) {
  return request<ImageGenerationRecords.ImageGenerationRecordListResponseData>({
    url: "/admin/image-generation-records",
    method: "get",
    params
  }).then((response) => {
    const records = response?.data?.list || []
    return {
      ...response,
      data: {
        ...response.data,
        list: records.map(record => ({
          ...record,
          cos_url: resolveCosImageUrl(record.cos_url)
        }))
      }
    }
  })
}

/** 设置为画廊图片 */
export function setGalleryFromGenerationRecordApi(id: number | string, data: ImageGenerationRecords.SetGalleryRequestData) {
  return request<ImageGenerationRecords.SetGalleryApiResponseData>({
    url: `/admin/image-generation-records/${id}/set-gallery`,
    method: "post",
    data
  })
}

/** 取消画廊图片 */
export function unsetGalleryFromGenerationRecordApi(id: number | string) {
  return request<ImageGenerationRecords.UnsetGalleryApiResponseData>({
    url: `/admin/image-generation-records/${id}/unset-gallery`,
    method: "post"
  })
}
