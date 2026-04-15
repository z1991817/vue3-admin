export type ModelStatus = 0 | 1

export interface CreateModelRequestData {
  name: string
  model_key?: string
  manufacturer?: string
  description?: string
  aspect_ratios?: string[]
  aspect_ratio?: string
  status?: ModelStatus
  consume_points: number
}

export interface UpdateModelRequestData extends Partial<CreateModelRequestData> {
  id: number
}

export interface ModelListRequestData {
  page: number
  pageSize: number
  name?: string
  status?: ModelStatus
}

export interface ModelData {
  id: number
  name: string
  model_key?: string
  manufacturer?: string
  description?: string
  aspect_ratio?: string | string[]
  aspect_ratios?: string[]
  status: ModelStatus
  consume_points: number
  created_at: string
  updated_at?: string
}

export type ModelListResponseData = ApiResponseData<{
  list: ModelData[]
  total: number
  page?: number
  pageSize?: number
}>

export type ModelDetailResponseData = ApiResponseData<ModelData>
