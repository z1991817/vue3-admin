<script setup>
import { getAdminUsersApi } from "@/common/apis/users"

const xGridDom = useTemplateRef("xGridDom")

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
            placeholder: "管理员用户名",
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
    { field: "username", title: "用户名", minWidth: "140px" },
    { field: "nickname", title: "昵称", minWidth: "140px" },
    { field: "role", title: "角色", minWidth: "120px", slots: { default: "role-column" } },
    { field: "status", title: "状态", width: "100px", slots: { default: "status-column" } },
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
          getAdminUsersApi({
            username: form.username || "",
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
    <vxe-grid ref="xGridDom" v-bind="xGridOpt">
      <template #role-column="{ row }">
        <el-tag type="primary" effect="plain">
          {{ row.role }}
        </el-tag>
      </template>
      <template #status-column="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="plain">
          {{ row.status === 1 ? "正常" : "禁用" }}
        </el-tag>
      </template>
    </vxe-grid>
  </div>
</template>

<style lang="scss" scoped></style>
