export type PromptLibraryStatus = 0 | 1

export interface PromptLibraryListRequestData {
  page: number
  pageSize: number
  keyword?: string
  status?: PromptLibraryStatus
}

export interface PromptLibraryData {
  id: number
  prompt: string
  image_url: string
  tag?: string | null
  sort_order: number
  status: PromptLibraryStatus
  created_at: string
  updated_at: string
}

export interface CreatePromptLibraryRequestData {
  prompt: string
  image_url: string
  tag?: string
  sort_order?: number
  status: PromptLibraryStatus
}

export interface UpdatePromptLibraryRequestData extends Partial<CreatePromptLibraryRequestData> {
  id: number
}

export interface UpdatePromptLibrarySortRequestData {
  id: number
  sort_order: number
}

export type PromptLibraryListResponseData = ApiResponseData<{
  list: PromptLibraryData[]
  total: number
  page?: number
  pageSize?: number
}>

export type PromptLibraryEnabledResponseData = ApiResponseData<PromptLibraryData[]>
export type PromptLibraryDetailResponseData = ApiResponseData<PromptLibraryData>
