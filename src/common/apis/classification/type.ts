export interface CreateOrUpdateClassificationRequestData {
  id?: number
  name: string
  description?: string
}

export interface ClassificationRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：分类名称 */
  name?: string
}

export interface ClassificationData {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export type ClassificationResponseData = ApiResponseData<{
  list: ClassificationData[]
  total: number
}>
