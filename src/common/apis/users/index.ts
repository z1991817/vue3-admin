import type * as Users from "./type"
import { request } from "@/http/axios"

export function getCurrentUserApi() {
  return request<Users.CurrentUserResponseData>({
    url: "admin/profile",
    method: "get"
  })
}

export function getAdminUsersApi(params: Users.AdminUserListRequestData) {
  return request<Users.AdminUserListResponseData>({
    url: "admin/users",
    method: "get",
    params
  })
}

export function logoutApi() {
  return request<ApiResponseData<null>>({
    url: "admin/logout",
    method: "post"
  })
}
