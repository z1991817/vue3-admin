export interface CreateOrUpdateImageRequestData {
  id?: number
  category_id: number
  title: string
  url: string
  description?: string
}

export interface ImageRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：分类ID */
  category_id?: number
  /** 查询参数：标题 */
  title?: string
}

export interface ImageData {
  id: number
  category_id: number
  title: string
  url: string
  description: string
  created_at: string
  updated_at: string
}

export type ImageResponseData = ApiResponseData<{
  list: ImageData[]
  total: number
}>
