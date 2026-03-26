import type * as Models from "./type"
import { request } from "@/http/axios"

/** 增 */
export function createModelApi(data: Models.CreateOrUpdateModelRequestData) {
  return request({
    url: "/admin/models",
    method: "post",
    data
  })
}

/** 删 */
export function deleteModelApi(id: number) {
  return request({
    url: `/admin/models/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateModelApi(data: Models.CreateOrUpdateModelRequestData) {
  return request({
    url: `/admin/models/${data.id}`,
    method: "put",
    data
  })
}

/** 查 */
export function getModelApi(params: Models.ModelRequestData) {
  return request<Models.ModelResponseData>({
    url: "/admin/models",
    method: "get",
    params
  })
}
