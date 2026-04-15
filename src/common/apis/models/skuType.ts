export type ModelSkuStatus = 0 | 1

export type ModelSkuSizeMode = "resolution" | "image_size"

export type ImageSizeOption = "1K" | "2K"

export interface ModelSkuListRequestData {
  page: number
  pageSize: number
  status?: ModelSkuStatus
}

export interface ModelSkuData {
  id: number
  model_id: number
  sku_code: string
  sku_name: string
  size_mode: ModelSkuSizeMode
  resolution?: string
  image_size?: ImageSizeOption | string
  consume_points: number
  is_default: 0 | 1
  status: ModelSkuStatus
  sort_order: number
  created_at: string
  updated_at?: string
}

export interface CreateModelSkuRequestData {
  sku_code: string
  sku_name: string
  size_mode: ModelSkuSizeMode
  resolution?: string
  image_size?: ImageSizeOption
  consume_points: number
  is_default?: 0 | 1
  status?: ModelSkuStatus
  sort_order?: number
}

export interface UpdateModelSkuRequestData extends Partial<CreateModelSkuRequestData> {}

export type ModelSkuListResponseData = ApiResponseData<{
  list: ModelSkuData[]
  total: number
  page?: number
  pageSize?: number
}>

export type ModelSkuDetailResponseData = ApiResponseData<ModelSkuData>
