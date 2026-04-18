<script setup>
import { getCurrentUserApi, resetAdminUserPasswordApi } from "@/common/apis/users"
import { useUserStore } from "@/pinia/stores/user"

const loading = ref(false)
const userStore = useUserStore()
const profile = reactive({
  id: 0,
  username: "",
  nickname: "",
  role: "",
  status: 1,
  last_login: "",
  created_at: ""
})

const statusText = computed(() => profile.status === 1 ? "正常" : "禁用")

async function loadProfile() {
  loading.value = true
  try {
    const { data } = await getCurrentUserApi()
    Object.assign(profile, data)
    await userStore.getInfo()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfile()
})

function handleResetPassword() {
  if (!profile.id) {
    ElMessage.warning("管理员信息未加载完成")
    return
  }

  ElMessageBox.prompt(`请输入管理员 ${profile.username} 的新密码`, "重置密码", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputType: "password",
    inputValue: "",
    inputPlaceholder: "请输入新密码（至少 6 位）",
    inputValidator: (value) => {
      const password = String(value || "").trim()
      if (!password) return "请输入新密码"
      if (password.length < 6) return "密码长度不能少于 6 位"
      return true
    }
  }).then(({ value }) => {
    const password = String(value || "").trim()
    resetAdminUserPasswordApi(profile.id, { password }).then(() => {
      ElMessage.success("密码重置成功")
    })
  }).catch(() => {})
}
</script>

<template>
  <div class="app-container" v-loading="loading">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div>
            <h3>管理员资料</h3>
            <p>展示当前登录管理员的账号信息和最近登录状态。</p>
          </div>
          <div class="header-actions">
            <el-button type="danger" plain @click="handleResetPassword">
              重置密码
            </el-button>
            <el-button type="primary" plain @click="loadProfile">
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="管理员 ID">{{ profile.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ profile.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ profile.nickname }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ profile.role }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="profile.status === 1 ? 'success' : 'danger'">{{ statusText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最近登录">{{ profile.last_login || "-" }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ profile.created_at }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  h3 {
    margin: 0 0 6px;
  }
  p {
    margin: 0;
    color: var(--el-text-color-secondary);
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
