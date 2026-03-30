import type * as Dashboard from "./type"
import { request } from "@/http/axios"

export function getDashboardOverviewApi() {
  return request<Dashboard.DashboardOverviewResponseData>({
    url: "admin/dashboard/overview",
    method: "get"
  })
}
