<script setup>
import { getCustomerPointsLogsApi } from "@/common/apis/customers"

const route = useRoute()
const xGridDom = useTemplateRef("xGridDom")

const changeTypeOptions = [
  { label: "全部类型", value: "" },
  { label: "充值", value: "recharge" },
  { label: "消费", value: "consume" },
  { label: "补偿", value: "manual_adjust" }
]

function goBack() {
  window.history.back()
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
        field: "changeType",
        itemRender: {
          name: "$select",
          options: changeTypeOptions,
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
    { field: "change_type", title: "变动类型", minWidth: "120px" },
    { field: "change_amount", title: "变动积分", width: "100px" },
    { field: "balance_after", title: "余额", width: "100px" },
    { field: "order_id", title: "关联订单", minWidth: "100px" },
    { field: "remark", title: "备注", minWidth: "180px" },
    { field: "created_at", title: "创建时间", minWidth: "180px" }
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
          getCustomerPointsLogsApi(route.params.id, {
            changeType: form.changeType || "",
            page: page.currentPage,
            pageSize: page.pageSize
          }).then(callback).catch(callback)
        })
      }
    }
  }
})
</script>

<template>
  <div class="app-container">
    <el-button @click="goBack">
      返回
    </el-button>
    <vxe-grid ref="xGridDom" v-bind="xGridOpt" />
  </div>
</template>

<style lang="scss" scoped></style>
