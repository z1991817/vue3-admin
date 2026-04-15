export interface ImageGenerationRecordListRequestData {
  userId?: number
  username?: string
  generation_type?: string
  status?: string
  page: number
  pageSize: number
}

export interface ImageGenerationRecordItem {
  id: number
  session_id?: string
  user_id: number
  username?: string
  nickname?: string
  email?: string
  phone?: string
  generation_type?: string
  prompt?: string
  source_image_url?: string | null
  source_image_urls?: string[] | string | null
  model?: string
  size?: string
  quality?: string
  style?: string
  n?: number
  third_party_url?: string | null
  cos_url?: string | null
  upload_task_id?: string | null
  status?: string
  is_in_gallery?: boolean
  gallery_image_id?: number | null
  error_message?: string | null
  created_at?: string
  updated_at?: string
}

export type ImageGenerationRecordListResponseData = ApiResponseData<{
  total: number
  list: ImageGenerationRecordItem[]
  page: number
  pageSize: number
  totalPages: number
}>

export interface SetGalleryRequestData {
  category_id?: number
  title?: string
  description?: string
}

export interface SetGalleryResponseData {
  imageId?: number
  existed?: boolean
  [key: string]: unknown
}

export type SetGalleryApiResponseData = ApiResponseData<SetGalleryResponseData>

export type UnsetGalleryApiResponseData = ApiResponseData<Record<string, unknown>>
