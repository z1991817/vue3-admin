import type * as Classification from "./type"
import { request } from "@/http/axios"

/** 增 */
export function createClassificationApi(data: Classification.CreateOrUpdateClassificationRequestData) {
  return request({
    url: "/admin/categories",
    method: "post",
    data
  })
}

/** 删 */
export function deleteClassificationApi(id: number) {
  return request({
    url: `/admin/categories/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateClassificationApi(data: Classification.CreateOrUpdateClassificationRequestData) {
  return request({
    url: `/admin/categories/${data.id}`,
    method: "put",
    data
  })
}

/** 查 */
export function getClassificationApi(params: Classification.ClassificationRequestData) {
  return request<Classification.ClassificationResponseData>({
    url: "admin/categories",
    method: "get",
    params
  })
}

/** 更新分类排序 */
export function updateClassificationSortApi(data: { id: number, sort_order: number }) {
  return request({
    url: `/admin/categories/${data.id}/sort`,
    method: "put",
    data: {
      sort_order: data.sort_order
    }
  })
}
