export interface LoginRequestData {
  /** admin 鎴?editor */
  username: "admin" | "editor"
  /** 瀵嗙爜 */
  password: string
  /** 楠岃瘉鐮?*/
  code: string
}

export type CaptchaResponseData = ApiResponseData<string>

export type LoginResponseData = ApiResponseData<{
  token: string
  userInfo?: {
    id: number
    username: string
    nickname: string
    role: string
  }
}>
