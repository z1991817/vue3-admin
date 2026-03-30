<script setup>
import { getCustomerDetailApi } from "@/common/apis/customers"

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const customer = ref(null)

async function loadDetail() {
  loading.value = true
  try {
    const { data } = await getCustomerDetailApi(route.params.id)
    customer.value = data
  } finally {
    loading.value = false
  }
}

function goPointsLogs() {
  router.push(`/customer-management/${route.params.id}/points-logs`)
}
function goBack() {
  window.history.back()
}
onMounted(() => {
  loadDetail()
})
</script>

<template>
  <div class="app-container customer-detail" v-loading="loading">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div>
            <h3>客户详情</h3>
            <p>{{ customer?.user?.username || "-" }}</p>
          </div>
          <div class="header__actions">
            <el-button @click="goPointsLogs">
              查看积分流水
            </el-button>
            <el-button type="primary" plain @click="loadDetail">
              刷新
            </el-button>
            <el-button @click="goBack">
              返回
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions v-if="customer" :column="2" border>
        <el-descriptions-item label="用户 ID">
          {{ customer.user.id }}
        </el-descriptions-item>
        <el-descriptions-item label="用户名">
          {{ customer.user.username }}
        </el-descriptions-item>
        <el-descriptions-item label="昵称">
          {{ customer.user.nickname }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="customer.user.status === 1 ? 'success' : 'danger'">
            {{ customer.user.status === 1 ? "正常" : "禁用" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ customer.user.email }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ customer.user.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="当前积分">
          {{ customer.user.points }}
        </el-descriptions-item>
        <el-descriptions-item label="累计充值金额">
          ¥{{ Number(customer.totalRechargeAmount || 0).toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="累计充值积分">
          {{ customer.totalRechargePoints }}
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">
          {{ customer.user.created_at }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never">
      <template #header>
        最近订单
      </template>
      <el-table :data="customer?.recentOrders || []" border>
        <el-table-column prop="order_no" label="订单号" min-width="180" />
        <el-table-column prop="package_name" label="套餐" min-width="140" />
        <el-table-column prop="amount" label="金额" min-width="100" />
        <el-table-column prop="points" label="积分" min-width="100" />
        <el-table-column prop="status" label="状态" min-width="100" />
        <el-table-column prop="created_at" label="创建时间" min-width="180" />
      </el-table>
    </el-card>

    <el-card shadow="never">
      <template #header>
        最近积分流水
      </template>
      <el-table :data="customer?.recentPointsLogs || []" border>
        <el-table-column prop="change_type" label="变动类型" min-width="120" />
        <el-table-column prop="change_amount" label="变动积分" min-width="100" />
        <el-table-column prop="balance_after" label="变动后余额" min-width="110" />
        <el-table-column prop="remark" label="备注" min-width="180" />
        <el-table-column prop="created_at" label="创建时间" min-width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.customer-detail {
  display: grid;
  gap: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  h3,
  p {
    margin: 0;
  }
  p {
    margin-top: 6px;
    color: var(--el-text-color-secondary);
  }
  &__actions {
    display: flex;
    gap: 12px;
  }
}
</style>
