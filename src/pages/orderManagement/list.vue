<script setup>
import { getOrderListApi } from "@/common/apis/orders"

const router = useRouter()
const xGridDom = useTemplateRef("xGridDom")

const statusOptions = [
  { label: "全部状态", value: "" },
  { label: "待支付", value: "pending" },
  { label: "已支付", value: "paid" },
  { label: "已关闭", value: "closed" }
]

function getStatusType(status) {
  if (status === "paid") return "success"
  if (status === "pending") return "warning"
  return "info"
}

const xGridOpt = reactive({
  loading: true,
  autoResize: true,
  pagerConfig: {
    align: "right"
  },
  formConfig: {
    items: [
      {
        field: "orderNo",
        itemRender: {
          name: "VxeInput",
          props: {
            placeholder: "订单号",
            clearable: true
          }
        }
      },
      {
        field: "username",
        itemRender: {
          name: "VxeInput",
          props: {
            placeholder: "用户名称",
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
    { field: "order_no", title: "订单号", minWidth: "180px" },
    { field: "username", title: "用户账号", minWidth: "140px" },
    { field: "nickname", title: "用户昵称", minWidth: "120px" },
    { field: "package_name", title: "套餐名称", minWidth: "140px" },
    { field: "amount", title: "支付金额", width: "100px" },
    { field: "points", title: "积分", width: "100px" },
    { field: "status", title: "状态", width: "100px", slots: { default: "status-column" } },
    { field: "paid_at", title: "支付时间", minWidth: "170px" },
    { field: "created_at", title: "创建时间", minWidth: "170px" },
    { title: "操作", width: "120px", fixed: "right", slots: { default: "row-operate" } }
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
              result = res.data.list
            }
            xGridOpt.loading = false
            resolve({ total, result })
          }
          getOrderListApi({
            orderNo: form.orderNo || "",
            username: form.username || "",
            status: form.status || "",
            page: page.currentPage,
            pageSize: page.pageSize
          }).then(callback).catch(callback)
        })
      }
    }
  }
})

function goDetail(row) {
  router.push(`/order-management/detail/${row.id}`)
}
</script>

<template>
  <div class="app-container">
    <vxe-grid ref="xGridDom" v-bind="xGridOpt">
      <template #status-column="{ row }">
        <el-tag :type="getStatusType(row.status)" effect="plain">
          {{ row.status || "-" }}
        </el-tag>
      </template>
      <template #row-operate="{ row }">
        <el-button link type="primary" @click="goDetail(row)">
          详情
        </el-button>
      </template>
    </vxe-grid>
  </div>
</template>

<style lang="scss" scoped></style>
