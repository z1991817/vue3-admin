<script setup>
import { getCustomerListApi, rechargeCustomerApi, resetCustomerPasswordApi, updateCustomerStatusApi } from "@/common/apis/customers"

const router = useRouter()
const xGridDom = useTemplateRef("xGridDom")
const statusLoadingMap = reactive({})

const statusOptions = [
  { label: "全部状态", value: undefined },
  { label: "正常", value: 1 },
  { label: "禁用", value: 0 }
]

const xGridOpt = reactive({
  loading: true,
  autoResize: true,
  pagerConfig: {
    align: "right"
  },
  formConfig: {
    items: [
      {
        field: "username",
        itemRender: {
          name: "VxeInput",
          props: {
            placeholder: "用户名 / 昵称 / 邮箱",
            clearable: true
          }
        }
      },
      {
        field: "status",
        itemRender: {
          name: "$select",
          options: statusOptions,
          props: {
            clearable: true
          }
        }
      },
      {
        itemRender: {
          name: "VxeButtonGroup",
          options: [
            { type: "submit", content: "查询", status: "primary", icon: "vxe-icon-search" },
            { type: "reset", content: "重置", icon: "vxe-icon-refresh" }
          ]
        }
      }
    ]
  },
  toolbarConfig: {
    refresh: true,
    custom: false
  },
  columns: [
    { type: "seq", width: "60px" },
    { field: "username", title: "用户名", minWidth: "120px" },
    { field: "nickname", title: "昵称", minWidth: "120px" },
    { field: "email", title: "邮箱", minWidth: "180px" },
    { field: "phone", title: "手机号", minWidth: "130px" },
    { field: "points", title: "当前积分", width: "100px" },
    { field: "total_recharge_amount", title: "累计充值金额", width: "130px" },
    { field: "status", title: "状态", width: "100px", slots: { default: "status-column" } },
    { field: "last_paid_at", title: "最近支付时间", minWidth: "170px" },
    { title: "操作", width: "360px", fixed: "right", slots: { default: "row-operate" } }
  ],
  proxyConfig: {
    seq: true,
    form: true,
    autoLoad: true,
    props: {
      total: "total"
    },
    ajax: {
      query: ({ page, form }) => {
        xGridOpt.loading = true
        xGridDom.value?.reloadData([])
        return new Promise((resolve) => {
          let total = 0
          let result = []
          const callback = (res) => {
            if (res?.data) {
              total = res.data.total
              result = res.data.data
            }
            xGridOpt.loading = false
            resolve({ total, result })
          }
          getCustomerListApi({
            username: form.username || "",
            status: form.status,
            page: page.currentPage,
            pageSize: page.pageSize
          }).then(callback).catch(callback)
        })
      }
    }
  }
})

function goDetail(row) {
  router.push(`/customer-management/detail/${row.id}`)
}

function goPoints(row) {
  router.push(`/customer-management/${row.id}/points-logs`)
}

function handleRecharge(row) {
  ElMessageBox.prompt(`请输入给用户 ${row.username} 充值的积分数量`, "充值积分", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputValue: "",
    inputPlaceholder: "请输入积分数量",
    inputValidator: (value) => {
      if (!value || !String(value).trim()) return "请输入积分数量"
      if (!/^\d+$/.test(String(value).trim())) return "积分数量必须为正整数"
      if (Number(String(value).trim()) <= 0) return "积分数量必须大于 0"
      return true
    }
  }).then(({ value }) => {
    const points = Number(String(value).trim())
    rechargeCustomerApi(row.id, { points }).then(() => {
      ElMessage.success("充值成功")
      xGridDom.value?.commitProxy("query")
    })
  }).catch(() => {})
}

function handleResetPassword(row) {
  ElMessageBox.prompt(`请输入用户 ${row.username} 的新密码`, "重置密码", {
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
    resetCustomerPasswordApi(row.id, { password }).then(() => {
      ElMessage.success("密码重置成功")
    })
  }).catch(() => {})
}

function handleToggleStatus(row) {
  const targetStatus = row.status === 1 ? 0 : 1
  const actionText = targetStatus === 1 ? "启用" : "禁用"
  ElMessageBox.confirm(`确认${actionText}用户 ${row.username} 吗？`, `${actionText}用户`, {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    statusLoadingMap[row.id] = true
    updateCustomerStatusApi(row.id, { status: targetStatus })
      .then(() => {
        ElMessage.success(`${actionText}成功`)
        xGridDom.value?.commitProxy("query")
      })
      .finally(() => {
        statusLoadingMap[row.id] = false
      })
  }).catch(() => {})
}
</script>

<template>
  <div class="app-container">
    <vxe-grid ref="xGridDom" v-bind="xGridOpt">
      <template #status-column="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="plain">
          {{ row.status === 1 ? "正常" : "禁用" }}
        </el-tag>
      </template>
      <template #row-operate="{ row }">
        <el-button link type="primary" @click="goDetail(row)">
          详情
        </el-button>
        <el-button link type="success" @click="handleRecharge(row)">
          充值
        </el-button>
        <el-button link type="danger" @click="handleResetPassword(row)">
          重置密码
        </el-button>
        <el-button
          link
          :type="row.status === 1 ? 'danger' : 'success'"
          :loading="Boolean(statusLoadingMap[row.id])"
          @click="handleToggleStatus(row)"
        >
          {{ row.status === 1 ? "禁用" : "启用" }}
        </el-button>
        <el-button link type="warning" @click="goPoints(row)">
          积分流水
        </el-button>
      </template>
    </vxe-grid>
  </div>
</template>

<style lang="scss" scoped></style>
