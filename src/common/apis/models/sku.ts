import type * as ModelSku from "./skuType"
import { request } from "@/http/axios"

/** SKU 列表 */
export function getModelSkuApi(modelId: number | string, params: ModelSku.ModelSkuListRequestData) {
  return request<ModelSku.ModelSkuListResponseData>({
    url: `/admin/models/${modelId}/skus`,
    method: "get",
    params
  })
}

/** SKU 详情 */
export function getModelSkuDetailApi(modelId: number | string, skuId: number | string) {
  return request<ModelSku.ModelSkuDetailResponseData>({
    url: `/admin/models/${modelId}/skus/${skuId}`,
    method: "get"
  })
}

/** 新增 SKU */
export function createModelSkuApi(modelId: number | string, data: ModelSku.CreateModelSkuRequestData) {
  return request({
    url: `/admin/models/${modelId}/skus`,
    method: "post",
    data
  })
}

/** 编辑 SKU */
export function updateModelSkuApi(modelId: number | string, skuId: number | string, data: ModelSku.UpdateModelSkuRequestData) {
  return request({
    url: `/admin/models/${modelId}/skus/${skuId}`,
    method: "put",
    data
  })
}

/** 设置默认 SKU */
export function setDefaultModelSkuApi(modelId: number | string, skuId: number | string) {
  return request({
    url: `/admin/models/${modelId}/skus/${skuId}/default`,
    method: "put"
  })
}

/** 删除 SKU（软删） */
export function deleteModelSkuApi(modelId: number | string, skuId: number | string) {
  return request({
    url: `/admin/models/${modelId}/skus/${skuId}`,
    method: "delete"
  })
}
