export interface AdminProfileData {
  id: number
  username: string
  nickname: string
  role: string
  status: number
  last_login: string | null
  created_at: string
}

export interface AdminUserListItem {
  id: number
  username: string
  nickname: string
  role: string
  status: number
  created_at: string
}

export interface AdminUserListRequestData {
  username?: string
  page?: number
  pageSize?: number
}

export type CurrentUserResponseData = ApiResponseData<AdminProfileData>

export type AdminUserListResponseData = ApiResponseData<{
  total: number
  list: AdminUserListItem[]
}>
