import type * as PromptLibraries from "./type"
import { request } from "@/http/axios"

/** 分页查询 */
export function getPromptLibrariesApi(params: PromptLibraries.PromptLibraryListRequestData) {
  return request<PromptLibraries.PromptLibraryListResponseData>({
    url: "/prompt-libraries",
    method: "get",
    params
  })
}

/** 查询启用项 */
export function getEnabledPromptLibrariesApi() {
  return request<PromptLibraries.PromptLibraryEnabledResponseData>({
    url: "/prompt-libraries/enabled",
    method: "get"
  })
}

/** 详情 */
export function getPromptLibraryDetailApi(id: number | string) {
  return request<PromptLibraries.PromptLibraryDetailResponseData>({
    url: `/prompt-libraries/${id}`,
    method: "get"
  })
}

/** 新增 */
export function createPromptLibraryApi(data: PromptLibraries.CreatePromptLibraryRequestData) {
  return request({
    url: "/prompt-libraries",
    method: "post",
    data
  })
}

/** 修改 */
export function updatePromptLibraryApi(data: PromptLibraries.UpdatePromptLibraryRequestData) {
  return request({
    url: `/prompt-libraries/${data.id}`,
    method: "put",
    data
  })
}

/** 修改排序 */
export function updatePromptLibrarySortApi(data: PromptLibraries.UpdatePromptLibrarySortRequestData) {
  return request({
    url: `/prompt-libraries/${data.id}/sort`,
    method: "put",
    data: {
      sort_order: data.sort_order
    }
  })
}

/** 删除 */
export function deletePromptLibraryApi(id: number | string) {
  return request({
    url: `/prompt-libraries/${id}`,
    method: "delete"
  })
}
