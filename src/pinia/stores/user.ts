import { getCurrentUserApi } from "@@/apis/users"
import { setToken as _setToken, getToken, removeToken } from "@@/utils/local-storage"
import { pinia } from "@/pinia"
import { resetRouter } from "@/router"
import { routerConfig } from "@/router/config"
import { useSettingsStore } from "./settings"
import { useTagsViewStore } from "./tags-view"

function normalizeRoles(role: string) {
  switch (role) {
    case "super_admin":
    case "admin":
      return ["admin"]
    case "editor":
      return ["editor"]
    default:
      return routerConfig.defaultRoles
  }
}

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(getToken() || "")

  const roles = ref<string[]>([])

  const username = ref<string>("")

  const nickname = ref<string>("")

  const role = ref<string>("")

  const status = ref<number>(1)

  const lastLogin = ref<string>("")

  const createdAt = ref<string>("")

  const tagsViewStore = useTagsViewStore()

  const settingsStore = useSettingsStore()

  const setToken = (value: string) => {
    _setToken(value)
    token.value = value
  }

  const getInfo = async () => {
    const { data } = await getCurrentUserApi()
    username.value = data.username
    nickname.value = data.nickname
    role.value = data.role
    status.value = data.status
    lastLogin.value = data.last_login || ""
    createdAt.value = data.created_at
    roles.value = normalizeRoles(data.role)
  }

  const changeRoles = (role: string) => {
    const newToken = `token-${role}`
    token.value = newToken
    _setToken(newToken)
    location.reload()
  }

  const clearUserState = () => {
    token.value = ""
    roles.value = []
    username.value = ""
    nickname.value = ""
    role.value = ""
    status.value = 1
    lastLogin.value = ""
    createdAt.value = ""
  }

  const logout = () => {
    removeToken()
    clearUserState()
    resetRouter()
    resetTagsView()
  }

  const resetToken = () => {
    removeToken()
    clearUserState()
  }

  const resetTagsView = () => {
    if (!settingsStore.cacheTagsView) {
      tagsViewStore.delAllVisitedViews()
      tagsViewStore.delAllCachedViews()
    }
  }

  return { token, roles, username, nickname, role, status, lastLogin, createdAt, setToken, getInfo, changeRoles, logout, resetToken }
})

export function useUserStoreOutside() {
  return useUserStore(pinia)
}
