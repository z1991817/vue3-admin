import type * as Models from "./type"
import { request } from "@/http/axios"

/** 增 */
export function createModelApi(data: Models.CreateModelRequestData) {
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
export function updateModelApi(data: Models.UpdateModelRequestData) {
  return request({
    url: `/admin/models/${data.id}`,
    method: "put",
    data
  })
}

/** 列表 */
export function getModelApi(params: Models.ModelListRequestData) {
  return request<Models.ModelListResponseData>({
    url: "/admin/models",
    method: "get",
    params
  })
}

/** 详情 */
export function getModelDetailApi(id: number | string) {
  return request<Models.ModelDetailResponseData>({
    url: `/admin/models/${id}`,
    method: "get"
  })
}
