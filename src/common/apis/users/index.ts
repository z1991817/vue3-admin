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

export function resetAdminUserPasswordApi(id: number | string, data: Users.AdminResetPasswordRequestData) {
  return request<Users.AdminResetPasswordResponseData>({
    url: `admin/users/${id}/password`,
    method: "post",
    data
  })
}

export function logoutApi() {
  return request<ApiResponseData<null>>({
    url: "admin/logout",
    method: "post"
  })
}
