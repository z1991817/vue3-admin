<script setup>
import { getCurrentUserApi } from "@/common/apis/users"
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
          <el-button type="primary" plain @click="loadProfile">
            刷新
          </el-button>
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
</style>
