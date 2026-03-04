<script setup>
import { deleteTableDataApi, getTableDataApi } from "@/common/apis/tables"

const xGridDom = useTemplateRef()
const xGridOpt = reactive({
  loading: true,
  autoResize: true,
  /** 分页配置项 */
  pagerConfig: {
    align: "right"
  },
  /** 表单配置项 */
  formConfig: {
    items: [
      {
        field: "username",
        itemRender: {
          name: "VxeInput",
          props: {
            placeholder: "用户名",
            clearable: true
          }
        }
      },
      {
        field: "phone",
        itemRender: {
          name: "VxeInput",
          props: {
            placeholder: "手机号",
            clearable: true
          }
        }
      },
      {
        itemRender: {
          name: "VxeButtonGroup",
          options: [
            {
              type: "submit",
              content: "查询",
              status: "primary",
              icon: "vxe-icon-search"
            },
            {
              type: "reset",
              content: "重置",
              icon: "vxe-icon-refresh"
            }
          ]
        }
      }
    ]
  },
  /** 工具栏配置 */
  // toolbarConfig: {
  //   refresh: true,
  //   custom: true,
  //   slots: {
  //     buttons: "toolbar-btns"
  //   }
  // },
  /** 自定义列配置项 */
  customConfig: {
    /** 是否允许列选中  */
    checkMethod: ({ column }) => !["username"].includes(column.field)
  },
  /** 列配置 */
  columns: [
    {
      type: "checkbox",
      width: "50px"
    },
    {
      field: "username",
      title: "用户名"
    },
    {
      field: "roles",
      title: "角色",
      slots: {
        default: "role-column"
      }
    },
    {
      field: "phone",
      title: "手机号"
    },
    {
      field: "status",
      title: "状态",
      slots: {
        default: "status-column"
      }
    },
    {
      field: "created_at",
      title: "创建时间"
    },
    {
      title: "操作",
      width: "150px",
      fixed: "right",
      showOverflow: false,
      slots: {
        default: "row-operate"
      }
    }
  ],
  /** 数据代理配置项（基于 Promise API） */
  proxyConfig: {
    /** 启用动态序号代理 */
    seq: true,
    /** 是否代理表单 */
    form: true,
    /** 是否自动加载，默认为 true */
    autoLoad: true,
    props: {
      total: "total"
    },
    ajax: {
      query: ({ page, form }) => {
        xGridOpt.loading = true
        crudStore.clearTable()
        return new Promise((resolve) => {
          let total = 0
          let result = []
          // 加载数据
          const callback = (res) => {
            if (res?.data) {
              // 总数
              total = res.data.total
              // 列表数据
              result = res.data.list
            }
            xGridOpt.loading = false
            // 返回值有格式要求，详情见 vxe-table 官方文档
            resolve({ total, result })
          }
          // 接口需要的参数
          const params = {
            username: form.username || "",
            phone: form.phone || "",
            size: page.pageSize,
            currentPage: page.currentPage
          }
          // 调用接口
          getTableDataApi(params).then(callback).catch(callback)
        })
      }
    }
  }
})
// #region 增删改查
const crudStore = reactive({
  /** 表单类型，true 表示修改，false 表示新增 */
  isUpdate: true,
  /** 加载表格数据 */
  commitQuery: () => xGridDom.value?.commitProxy("query"),
  /** 清空表格数据 */
  clearTable: () => xGridDom.value?.reloadData([]),
  /** 点击显示弹窗 */
  onShowModal: (row) => {
    if (row) {
      crudStore.isUpdate = true
      xModalOpt.title = "修改用户"
      // 赋值
      xFormOpt.data.username = row.username
    } else {
      crudStore.isUpdate = false
      xModalOpt.title = "新增用户"
    }
    // 禁用表单项
    const props = xFormOpt.items?.[0]?.itemRender?.props
    props && (props.disabled = crudStore.isUpdate)
    xModalDom.value?.open()
    nextTick(() => {
      !crudStore.isUpdate && xFormDom.value?.reset()
      xFormDom.value?.clearValidate()
    })
  },
  /** 确定并保存 */
  onSubmitForm: () => {
    if (xFormOpt.loading) return
    xFormDom.value?.validate((errMap) => {
      if (errMap) return
      xFormOpt.loading = true
      const callback = () => {
        xFormOpt.loading = false
        xModalDom.value?.close()
        ElMessage.success("操作成功")
        !crudStore.isUpdate && crudStore.afterInsert()
        crudStore.commitQuery()
      }
      if (crudStore.isUpdate) {
        // 模拟调用修改接口成功
        setTimeout(() => callback(), 1000)
      } else {
        // 模拟调用新增接口成功
        setTimeout(() => callback(), 1000)
      }
    })
  },
  /** 新增后是否跳入最后一页 */
  afterInsert: () => {
    const pager = xGridDom.value?.getProxyInfo()?.pager
    if (pager) {
      const currentTotal = pager.currentPage * pager.pageSize
      if (currentTotal === pager.total) {
        ++pager.currentPage
      }
    }
  },
  /** 删除 */
  onDelete: (row) => {
    const tip = `确定 <strong style="color: var(--el-color-danger);"> 删除 </strong> 用户 <strong style="color: var(--el-color-primary);"> ${row.username} </strong> ？`
    const config = {
      type: "warning",
      showClose: true,
      closeOnClickModal: true,
      closeOnPressEscape: true,
      cancelButtonText: "取消",
      confirmButtonText: "确定",
      dangerouslyUseHTMLString: true
    }
    ElMessageBox.confirm(tip, "提示", config).then(() => {
      deleteTableDataApi(row.id).then(() => {
        ElMessage.success("删除成功")
        crudStore.afterDelete()
        crudStore.commitQuery()
      })
    })
  },
  /** 删除后是否返回上一页 */
  afterDelete: () => {
    const tableData = xGridDom?.value.getData()
    const pager = xGridDom.value?.getProxyInfo()?.pager
    if (pager && pager.currentPage > 1 && tableData.length === 1) {
      --pager.currentPage
    }
  },
  /** 更多自定义方法 */
  moreFn: () => {}
})
// #endregion
</script>

<template>
  <div class="app-container">
    <vxe-grid ref="xGridDom" v-bind="xGridOpt">
      <!-- 角色列 -->
      <template #role-column="{ row, column }">
        <el-tag
          :type="row[column.role] === 'admin' ? 'primary' : 'warning'"
          effect="plain"
        >
          {{ row.nickname }}
        </el-tag>
      </template>
      <!-- 状态列 -->
      <template #status-column="{ row, column }">
        <el-tag
          :type="row[column.field] ? 'success' : 'danger'"
          effect="plain"
        >
          {{ row[column.field] ? "启用" : "禁用" }}
        </el-tag>
      </template>
      <!-- 操作 -->
      <template #row-operate="{ row }">
        <el-button link type="primary" @click="crudStore.onShowModal(row)">
          修改
        </el-button>
        <el-button link type="danger" @click="crudStore.onDelete(row)">
          删除
        </el-button>
      </template>
    </vxe-grid>
  </div>
</template>

<style></style>
