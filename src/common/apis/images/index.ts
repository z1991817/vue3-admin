import type * as Images from "./type"
import { request } from "@/http/axios"

/** 增 */
export function createImageApi(data: Images.CreateOrUpdateImageRequestData) {
  return request({
    url: "/admin/images/create",
    method: "post",
    data
  })
}

/** 删 */
export function deleteImageApi(id: number) {
  return request({
    url: `/admin/images/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateImageApi(data: Images.CreateOrUpdateImageRequestData) {
  return request({
    url: `/admin/images/${data.id}`,
    method: "put",
    data
  })
}

/** 查 */
export function getImageApi(params: Images.ImageRequestData) {
  return request<Images.ImageResponseData>({
    url: "/admin/images",
    method: "get",
    params
  })
}
