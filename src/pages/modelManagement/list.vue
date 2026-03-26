<script setup>
import { createModelApi, deleteModelApi, getModelApi, updateModelApi } from "@/common/apis/models"

const textMap = {
  searchPlaceholder: "请输入模型名称",
  search: "查询",
  reset: "重置",
  add: "新增模型",
  edit: "编辑模型",
  create: "新增模型",
  name: "名称",
  manufacturer: "厂家",
  description: "描述",
  aspectRatio: "尺寸",
  status: "状态",
  show: "显示",
  hide: "隐藏",
  consumePoints: "消耗积分",
  createdAt: "创建时间",
  action: "操作",
  editAction: "编辑",
  deleteAction: "删除",
  success: "操作成功",
  deleteSuccess: "删除成功",
  confirmTitle: "提示",
  confirmDelete: name => `确定 <strong style="color: var(--el-color-danger);"> 删除 </strong> 模型 <strong style="color: var(--el-color-primary);"> ${name} </strong> 吗？`,
  cancel: "取消",
  confirm: "确定",
  inputName: "请输入模型名称",
  inputManufacturer: "请输入厂家",
  inputDescription: "请输入描述",
  inputAspectRatio: "请选择尺寸",
  inputStatus: "请选择状态",
  inputConsumePoints: "请输入消耗积分",
  invalidBlank: "空格无效",
  invalidConsumePoints: "消耗积分不能小于 0"
}
const sizeOptions = ["1:1", "16:9", "9:16", "4:3", "3:4"]
const statusOptions = [
  { label: textMap.show, value: 1 },
  { label: textMap.hide, value: 0 }
]

function normalizeConsumePoints(value) {
  if (value === undefined || value === null || value === "") return undefined
  const points = Number(value)
  return Number.isNaN(points) ? undefined : points
}

function normalizeStatus(value) {
  return Number(value) === 0 ? 0 : 1
}

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
        field: "name",
        itemRender: {
          name: "VxeInput",
          props: {
            placeholder: textMap.searchPlaceholder,
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
              content: textMap.search,
              status: "primary",
              icon: "vxe-icon-search"
            },
            {
              type: "reset",
              content: textMap.reset,
              icon: "vxe-icon-refresh"
            }
          ]
        }
      }
    ]
  },
  toolbarConfig: {
    refresh: true,
    custom: false,
    slots: {
      buttons: "toolbar-btns"
    }
  },
  columns: [
    {
      type: "checkbox",
      width: "50px"
    },
    {
      field: "name",
      title: textMap.name,
      minWidth: "180px"
    },
    {
      field: "manufacturer",
      title: textMap.manufacturer,
      minWidth: "160px"
    },
    {
      field: "description",
      title: textMap.description,
      minWidth: "260px"
    },
    {
      field: "aspect_ratio",
      title: textMap.aspectRatio,
      width: "140px"
    },
    {
      field: "consume_points",
      title: textMap.consumePoints,
      width: "120px"
    },
    {
      field: "status",
      title: textMap.status,
      width: "100px",
      slots: {
        default: "status-column"
      }
    },
    {
      field: "created_at",
      title: textMap.createdAt,
      width: "180px"
    },
    {
      title: textMap.action,
      width: "150px",
      fixed: "right",
      showOverflow: false,
      slots: {
        default: "row-operate"
      }
    }
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
        crudStore.clearTable()
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
          getModelApi({
            name: form.name || "",
            size: page.pageSize,
            currentPage: page.currentPage
          }).then(callback).catch(callback)
        })
      }
    }
  }
})

const crudStore = reactive({
  isUpdate: true,
  commitQuery: () => xGridDom.value?.commitProxy("query"),
  clearTable: () => xGridDom.value?.reloadData([]),
  onShowModal: (row) => {
    if (row) {
      crudStore.isUpdate = true
      xModalOpt.title = textMap.edit
      xFormOpt.data.id = row.id
      xFormOpt.data.name = row.name
      xFormOpt.data.manufacturer = row.manufacturer || ""
      xFormOpt.data.description = row.description
      xFormOpt.data.aspect_ratio = row.aspect_ratio ? row.aspect_ratio.split(",").map(item => item.trim()).filter(Boolean) : []
      xFormOpt.data.status = normalizeStatus(row.status)
      xFormOpt.data.consume_points = normalizeConsumePoints(row.consume_points)
    } else {
      crudStore.isUpdate = false
      xModalOpt.title = textMap.create
      xFormOpt.data.id = undefined
      xFormOpt.data.name = ""
      xFormOpt.data.manufacturer = ""
      xFormOpt.data.description = ""
      xFormOpt.data.aspect_ratio = []
      xFormOpt.data.status = 1
      xFormOpt.data.consume_points = undefined
    }
    xModalDom.value?.open()
    nextTick(() => {
      xFormDom.value?.clearValidate()
    })
  },
  onSubmitForm: () => {
    if (xFormOpt.loading) return
    xFormDom.value?.validate((errMap) => {
      if (errMap) return
      xFormOpt.loading = true
      const { aspect_ratio, ...restData } = xFormOpt.data
      const payload = {
        ...restData,
        aspect_ratios: aspect_ratio,
        status: normalizeStatus(xFormOpt.data.status),
        consume_points: normalizeConsumePoints(xFormOpt.data.consume_points)
      }
      const callback = () => {
        xFormOpt.loading = false
        xModalDom.value?.close()
        ElMessage.success(textMap.success)
        !crudStore.isUpdate && crudStore.afterInsert()
        crudStore.commitQuery()
      }
      const api = crudStore.isUpdate ? updateModelApi : createModelApi
      api(payload).then(callback).catch(() => {
        xFormOpt.loading = false
      })
    })
  },
  afterInsert: () => {
    const pager = xGridDom.value?.getProxyInfo()?.pager
    if (pager) {
      const currentTotal = pager.currentPage * pager.pageSize
      if (currentTotal === pager.total) {
        ++pager.currentPage
      }
    }
  },
  onDelete: (row) => {
    const config = {
      type: "warning",
      showClose: true,
      closeOnClickModal: true,
      closeOnPressEscape: true,
      cancelButtonText: textMap.cancel,
      confirmButtonText: textMap.confirm,
      dangerouslyUseHTMLString: true
    }
    ElMessageBox.confirm(textMap.confirmDelete(row.name), textMap.confirmTitle, config).then(() => {
      deleteModelApi(row.id).then(() => {
        ElMessage.success(textMap.deleteSuccess)
        crudStore.afterDelete()
        crudStore.commitQuery()
      })
    })
  },
  afterDelete: () => {
    const tableData = xGridDom?.value.getData()
    const pager = xGridDom.value?.getProxyInfo()?.pager
    if (pager && pager.currentPage > 1 && tableData.length === 1) {
      --pager.currentPage
    }
  }
})

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

const xFormDom = useTemplateRef("xFormDom")
const xFormOpt = reactive({
  span: 24,
  titleWidth: "100px",
  loading: false,
  titleColon: false,
  data: {
    id: undefined,
    name: "",
    manufacturer: "",
    description: "",
    aspect_ratio: [],
    status: 1,
    consume_points: undefined
  },
  rules: {
    name: [
      {
        required: true,
        validator: ({ itemValue }) => {
          switch (true) {
            case !itemValue:
              return new Error(textMap.inputName)
            case !itemValue.trim():
              return new Error(textMap.invalidBlank)
          }
        }
      }
    ],
    size: [
      {
        required: true,
        validator: ({ itemValue }) => {
          if (!Array.isArray(itemValue) || itemValue.length === 0) {
            return new Error(textMap.inputAspectRatio)
          }
        }
      }
    ],
    status: [
      {
        required: true,
        validator: ({ itemValue }) => {
          if (![0, 1].includes(Number(itemValue))) {
            return new Error(textMap.inputStatus)
          }
        }
      }
    ],
    consume_points: [
      {
        required: true,
        validator: ({ itemValue }) => {
          const points = normalizeConsumePoints(itemValue)
          if (points === undefined) {
            return new Error(textMap.inputConsumePoints)
          }
          if (points < 0) {
            return new Error(textMap.invalidConsumePoints)
          }
        }
      }
    ]
  },
  items: [
    {
      field: "name",
      title: textMap.name,
      itemRender: {
        name: "$input",
        props: {
          placeholder: textMap.inputName
        }
      }
    },
    {
      field: "description",
      title: textMap.description,
      itemRender: {
        name: "$input",
        props: {
          placeholder: textMap.inputDescription,
          type: "textarea",
          rows: 4
        }
      }
    },
    {
      field: "manufacturer",
      title: textMap.manufacturer,
      itemRender: {
        name: "$input",
        props: {
          placeholder: textMap.inputManufacturer
        }
      }
    },
    {
      field: "aspect_ratio",
      title: textMap.aspectRatio,
      slots: {
        default: "aspect-ratio-slot"
      }
    },
    {
      field: "consume_points",
      title: textMap.consumePoints,
      itemRender: {
        name: "$input",
        props: {
          type: "number",
          min: 0,
          placeholder: textMap.inputConsumePoints
        }
      }
    },
    {
      field: "status",
      title: textMap.status,
      slots: {
        default: "status-slot"
      }
    },
    {
      align: "right",
      itemRender: {
        name: "$buttons",
        children: [
          {
            props: {
              content: textMap.cancel
            },
            events: {
              click: () => xModalDom.value?.close()
            }
          },
          {
            props: {
              type: "submit",
              content: textMap.confirm,
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
</script>

<template>
  <div class="app-container">
    <vxe-grid ref="xGridDom" v-bind="xGridOpt">
      <template #toolbar-btns>
        <vxe-button status="primary" icon="vxe-icon-add" @click="crudStore.onShowModal()">
          {{ textMap.add }}
        </vxe-button>
      </template>
      <template #status-column="{ row, column }">
        <el-tag :type="Number(row[column.field]) === 1 ? 'success' : 'info'" effect="plain">
          {{ Number(row[column.field]) === 1 ? textMap.show : textMap.hide }}
        </el-tag>
      </template>
      <template #row-operate="{ row }">
        <el-button link type="primary" @click="crudStore.onShowModal(row)">
          {{ textMap.editAction }}
        </el-button>
        <el-button link type="danger" @click="crudStore.onDelete(row)">
          {{ textMap.deleteAction }}
        </el-button>
      </template>
    </vxe-grid>
    <vxe-modal ref="xModalDom" v-bind="xModalOpt">
      <vxe-form ref="xFormDom" v-bind="xFormOpt">
        <template #aspect-ratio-slot>
          <el-checkbox-group v-model="xFormOpt.data.aspect_ratio">
            <el-checkbox v-for="item in sizeOptions" :key="item" :value="item">
              {{ item }}
            </el-checkbox>
          </el-checkbox-group>
        </template>
        <template #status-slot>
          <el-radio-group v-model="xFormOpt.data.status">
            <el-radio v-for="item in statusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </template>
      </vxe-form>
    </vxe-modal>
  </div>
</template>

<style lang="sass" scoped></style>







