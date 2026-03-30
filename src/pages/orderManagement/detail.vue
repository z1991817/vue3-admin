<script setup>
import { getOrderDetailApi } from "@/common/apis/orders"

const route = useRoute()
const loading = ref(false)
const orderData = ref(null)
const transactions = ref([])

function stringify(value) {
  if (value === null || value === undefined || value === "") return "-"
  if (typeof value === "object") return JSON.stringify(value, null, 2)
  return String(value)
}

async function loadDetail() {
  loading.value = true
  try {
    const { data } = await getOrderDetailApi(route.params.id)
    orderData.value = data.order
    transactions.value = data.transactions
  } finally {
    loading.value = false
  }
}

function goBack() {
  window.history.back()
}

onMounted(() => {
  loadDetail()
})
</script>

<template>
  <div class="app-container order-detail" v-loading="loading">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div>
            <h3>订单详情</h3>
            <p>{{ orderData?.order_no || "-" }}</p>
          </div>
          <div>
            <el-button type="primary" plain @click="loadDetail">
              刷新
            </el-button>
            <el-button @click="goBack">
              返回
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions v-if="orderData" :column="2" border>
        <el-descriptions-item label="订单号">
          {{ orderData.order_no }}
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          {{ orderData.status }}
        </el-descriptions-item>
        <el-descriptions-item label="用户账号">
          {{ orderData.username }}
        </el-descriptions-item>
        <el-descriptions-item label="用户昵称">
          {{ orderData.nickname }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ orderData.email }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ orderData.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="套餐">
          {{ orderData.package_name }}
        </el-descriptions-item>
        <el-descriptions-item label="订单类型">
          {{ orderData.order_type }}
        </el-descriptions-item>
        <el-descriptions-item label="支付金额">
          ¥{{ Number(orderData.amount || 0).toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="充值积分">
          {{ orderData.points }}
        </el-descriptions-item>
        <el-descriptions-item label="当前积分">
          {{ orderData.current_points }}
        </el-descriptions-item>
        <el-descriptions-item label="支付渠道">
          {{ orderData.payment_channel }}
        </el-descriptions-item>
        <el-descriptions-item label="第三方订单号">
          {{ orderData.third_party_order_no || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">
          {{ orderData.paid_at || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ orderData.created_at }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ orderData.updated_at }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never">
      <template #header>
        交易流水
      </template>
      <el-table :data="transactions" border>
        <el-table-column prop="channel" label="渠道" min-width="120" />
        <el-table-column prop="transaction_type" label="交易类型" min-width="120" />
        <el-table-column prop="trade_no" label="交易号" min-width="160" />
        <el-table-column prop="status" label="状态" min-width="100" />
        <el-table-column prop="created_at" label="创建时间" min-width="180" />
      </el-table>

      <div v-for="item in transactions" :key="item.id" class="transaction-json">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="请求数据">
            <pre>{{ stringify(item.request_data) }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="响应数据">
            <pre>{{ stringify(item.response_data) }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="回调数据">
            <pre>{{ stringify(item.callback_data) }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.order-detail {
  display: grid;
  gap: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  h3,
  p {
    margin: 0;
  }
  p {
    margin-top: 6px;
    color: var(--el-text-color-secondary);
  }
}

.transaction-json {
  margin-top: 16px;
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
