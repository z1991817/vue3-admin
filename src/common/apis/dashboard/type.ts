export interface DashboardOverviewData {
  todayOrderCount: number
  todayPaidAmount: number
  totalUsers: number
  todayNewUsers: number
  totalModels: number
  enabledModels: number
  totalCategories: number
  totalImages: number
  todayGenerationCount: number
  todayPointsConsumed: number
}

export type DashboardOverviewResponseData = ApiResponseData<DashboardOverviewData>
