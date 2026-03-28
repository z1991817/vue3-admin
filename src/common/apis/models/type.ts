export interface CreateOrUpdateModelRequestData {
  id?: number
  name: string
  model_key: string
  manufacturer?: string
  description?: string
  aspect_ratios: string[]
  status: number
  consume_points: number | undefined
}

export interface ModelRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：模型名称 */
  name?: string
  /** 查询参数：模型 key */
  model_key?: string
}

export interface ModelData {
  id: number
  name: string
  model_key: string
  manufacturer?: string
  description: string
  aspect_ratio: string[]
  status: number
  consume_points: number
  created_at: string
  updated_at?: string
}

export type ModelResponseData = ApiResponseData<{
  list: ModelData[]
  total: number
}>
