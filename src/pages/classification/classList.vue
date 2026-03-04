<script setup>
import { createClassificationApi, deleteClassificationApi, getClassificationApi, updateClassificationApi, updateClassificationSortApi } from "@/common/apis/classification"

const xGridDom = useTemplateRef("xGridDom")
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
        field: "name",
        itemRender: {
          name: "VxeInput",
          props: {
            placeholder: "分类名称",
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
  toolbarConfig: {
    refresh: true,
    custom: false,
    slots: {
      buttons: "toolbar-btns"
    }
  },
  /** 自定义列配置项 */
  customConfig: {
    /** 是否允许列选中  */
    checkMethod: ({ column }) => !["name"].includes(column.field)
  },
  /** 列配置 */
  columns: [
    {
      type: "checkbox",
      width: "50px"
    },
    {
      field: "name",
      title: "分类名称"
    },
    {
      field: "description",
      title: "描述"
    },
    {
      field: "sort_order",
      title: "序号",
      slots: {
        default: "row-sort"
      }
    },
    {
      field: "created_at",
      title: "创建时间"
    },
    {
      field: "updated_at",
      title: "更新时间"
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
            name: form.name || "",
            pageSize: page.pageSize,
            page: page.currentPage
          }
          // 调用接口
          getClassificationApi(params).then(callback).catch(callback)
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
      xModalOpt.title = "修改分类"
      // 赋值
      xFormOpt.data.id = row.id
      xFormOpt.data.name = row.name
      xFormOpt.data.description = row.description
    } else {
      crudStore.isUpdate = false
      xModalOpt.title = "新增分类"
      // 清空表单数据
      xFormOpt.data.id = undefined
      xFormOpt.data.name = ""
      xFormOpt.data.description = ""
    }
    xModalDom.value?.open()
    nextTick(() => {
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
        // 调用修改接口
        updateClassificationApi(xFormOpt.data).then(callback).catch(() => {
          xFormOpt.loading = false
        })
      } else {
        // 调用新增接口
        createClassificationApi(xFormOpt.data).then(callback).catch(() => {
          xFormOpt.loading = false
        })
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
    const tip = `确定 <strong style="color: var(--el-color-danger);"> 删除 </strong> 分类 <strong style="color: var(--el-color-primary);"> ${row.name} </strong> ？`
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
      deleteClassificationApi(row.id).then(() => {
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
  }
})
// #endregion

// #region 弹窗
const xModalDom = useTemplateRef("xModalDom")
const xModalOpt = reactive({
  title: "",
  showClose: true,
  escClosable: true,
  maskClosable: true,
  beforeHideMethod: () => {
    xFormDom.value?.clearValidate()
    return Promise.resolve()
  }
})
// #endregion

// #region 表单
const xFormDom = useTemplateRef("xFormDom")
const xFormOpt = reactive({
  span: 24,
  titleWidth: "100px",
  loading: false,
  /** 是否显示标题冒号 */
  titleColon: false,
  data: {
    id: undefined,
    name: "",
    description: ""
  },
  rules: {
    name: [
      {
        required: true,
        validator: ({ itemValue }) => {
          switch (true) {
            case !itemValue:
              return new Error("请输入分类名称")
            case !itemValue.trim():
              return new Error("空格无效")
          }
        }
      }
    ]
  },
  items: [
    {
      field: "name",
      title: "分类名称",
      itemRender: {
        name: "$input",
        props: {
          placeholder: "请输入分类名称"
        }
      }
    },
    {
      field: "description",
      title: "描述",
      itemRender: {
        name: "$input",
        props: {
          placeholder: "请输入描述",
          type: "textarea",
          rows: 4
        }
      }
    },
    {
      align: "right",
      itemRender: {
        name: "$buttons",
        children: [
          {
            props: {
              content: "取消"
            },
            events: {
              click: () => xModalDom.value?.close()
            }
          },
          {
            props: {
              type: "submit",
              content: "确定",
              status: "primary"
            },
            events: {
              click: () => crudStore.onSubmitForm()
            }
          }
        ]
      }
    }
  ]
})
// #endregion

function changeEvent(params) {
  updateClassificationSortApi({ id: params.id, sort_order: params.sort_order }).then((res) => {
    console.log(res)
    ElMessage.success("操作成功")
    crudStore.commitQuery()
  })
}
</script>

<template>
  <div class="app-container">
    <vxe-grid ref="xGridDom" v-bind="xGridOpt">
      <!-- 工具栏按钮 -->
      <template #toolbar-btns>
        <vxe-button status="primary" icon="vxe-icon-add" @click="crudStore.onShowModal()">
          新增分类
        </vxe-button>
      </template>
      <template #row-sort="{ row }">
        <el-input-number min="0" v-model="row.sort_order" @change="changeEvent(row)" />
        <!-- <vxe-number-input v-model="row.sort_order" @change="changeEvent(params)" /> -->
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
    <!-- 弹窗 -->
    <vxe-modal ref="xModalDom" v-bind="xModalOpt">
      <!-- 表单 -->
      <vxe-form ref="xFormDom" v-bind="xFormOpt" />
    </vxe-modal>
  </div>
</template>

<style lang="sass" scoped></style>
