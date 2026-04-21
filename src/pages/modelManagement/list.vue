<script setup>
import { createModelApi, deleteModelApi, getModelApi, updateModelApi, updateModelSortApi } from "@/common/apis/models"

const router = useRouter()

const textMap = {
  searchPlaceholder: "请输入模型名称",
  search: "查询",
  reset: "重置",
  allStatus: "全部状态",
  add: "新增模型",
  edit: "编辑模型",
  create: "新增模型",
  name: "名称",
  modelKey: "模型Key",
  manufacturer: "厂家",
  description: "描述",
  aspectRatio: "尺寸",
  sortOrder: "排序",
  status: "状态",
  enabled: "启用",
  disabled: "停用",
  consumePoints: "模型默认积分",
  createdAt: "创建时间",
  action: "操作",
  editAction: "编辑",
  deleteAction: "删除",
  skuAction: "SKU 管理",
  success: "操作成功",
  deleteSuccess: "删除成功",
  confirmTitle: "提示",
  confirmDelete: name => `确定 <strong style=\"color: var(--el-color-danger);\"> 删除 </strong> 模型 <strong style=\"color: var(--el-color-primary);\"> ${name} </strong> 吗？删除前请确保该模型下 SKU 已处理。`,
  cancel: "取消",
  confirm: "确定",
  inputName: "请输入模型名称",
  inputModelKey: "请输入模型Key（可选）",
  inputManufacturer: "请输入厂家",
  inputDescription: "请输入描述",
  inputStatus: "请选择状态",
  inputConsumePoints: "请输入模型默认积分",
  invalidBlank: "空格无效",
  invalidConsumePoints: "积分必须是大于等于 0 的整数",
  invalidSortOrder: "排序值必须是大于等于 0 的整数"
}

const preferredAspectRatioOrder = ["1:1", "2:3", "3:4", "4:3", "3:2", "9:16", "16:9"]
const defaultAspectRatioOptions = [...preferredAspectRatioOrder]

function normalizeAspectRatioText(value) {
  return String(value).trim().replace(/\s+/g, "").replace(/：/g, ":")
}

function getAspectRatioSortValue(value) {
  const matched = normalizeAspectRatioText(value).match(/^(\d+):(\d+)$/)
  if (!matched) return Number.POSITIVE_INFINITY
  const width = Number(matched[1])
  const height = Number(matched[2])
  if (width <= 0 || height <= 0) return Number.POSITIVE_INFINITY
  return width / height
}

function sortAspectRatios(values) {
  const orderMap = new Map(preferredAspectRatioOrder.map((item, index) => [item, index]))
  return [...new Set(values.map(item => normalizeAspectRatioText(item)).filter(Boolean))].sort((a, b) => {
    const aOrder = orderMap.get(a)
    const bOrder = orderMap.get(b)
    const aInPreferred = aOrder !== undefined
    const bInPreferred = bOrder !== undefined
    if (aInPreferred && bInPreferred) {
      return aOrder - bOrder
    }
    if (aInPreferred) return -1
    if (bInPreferred) return 1
    const aValue = getAspectRatioSortValue(a)
    const bValue = getAspectRatioSortValue(b)
    if (Number.isFinite(aValue) && Number.isFinite(bValue) && aValue !== bValue) return aValue - bValue
    return a.localeCompare(b)
  })
}

const aspectRatioOptions = ref(sortAspectRatios(defaultAspectRatioOptions))

const queryStatusOptions = [
  { label: textMap.allStatus, value: "" },
  { label: textMap.enabled, value: 1 },
  { label: textMap.disabled, value: 0 }
]

const statusOptions = [
  { label: textMap.enabled, value: 1 },
  { label: textMap.disabled, value: 0 }
]

function normalizeStatus(value) {
  return Number(value) === 0 ? 0 : 1
}

function normalizeInteger(value) {
  if (value === undefined || value === null || value === "") return undefined
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) return undefined
  return parsed
}

function normalizeAspectRatios(value) {
  if (Array.isArray(value)) {
    return value.map(item => normalizeAspectRatioText(item)).filter(Boolean)
  }
  if (typeof value === "string") {
    return value.split(",").map(item => normalizeAspectRatioText(item)).filter(Boolean)
  }
  return []
}

function getModelAspectRatios(model) {
  if (Array.isArray(model?.aspect_ratios)) return normalizeAspectRatios(model.aspect_ratios)
  return normalizeAspectRatios(model?.aspect_ratio)
}

function getAspectRatioText(row) {
  const ratios = sortAspectRatios(getModelAspectRatios(row))
  if (ratios.length === 0) return "-"
  return ratios.join(" / ")
}

function syncAspectRatioOptions(value) {
  const dynamicOptions = normalizeAspectRatios(value)
  aspectRatioOptions.value = sortAspectRatios([...defaultAspectRatioOptions, ...dynamicOptions])
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
        field: "status",
        itemRender: {
          name: "$select",
          options: queryStatusOptions,
          props: {
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
      field: "model_key",
      title: textMap.modelKey,
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
      minWidth: "180px",
      slots: {
        default: "aspect-ratio-column"
      }
    },
    {
      field: "consume_points",
      title: textMap.consumePoints,
      width: "140px"
    },
    {
      field: "sort_order",
      title: textMap.sortOrder,
      width: "120px",
      slots: {
        default: "sort-order-column"
      }
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
      width: "220px",
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
          const params = {
            name: form.name?.trim() || "",
            pageSize: page.pageSize,
            page: page.currentPage
          }
          if (form.status !== "" && form.status !== undefined && form.status !== null) {
            params.status = normalizeStatus(form.status)
          }
          getModelApi(params).then(callback).catch(callback)
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
      xFormOpt.data.name = row.name || ""
      xFormOpt.data.model_key = row.model_key || ""
      xFormOpt.data.manufacturer = row.manufacturer || ""
      xFormOpt.data.description = row.description || ""
      xFormOpt.data.aspect_ratio = sortAspectRatios(getModelAspectRatios(row))
      syncAspectRatioOptions(xFormOpt.data.aspect_ratio)
      xFormOpt.data.status = normalizeStatus(row.status)
      xFormOpt.data.consume_points = normalizeInteger(row.consume_points)
    } else {
      crudStore.isUpdate = false
      xModalOpt.title = textMap.create
      xFormOpt.data.id = undefined
      xFormOpt.data.name = ""
      xFormOpt.data.model_key = ""
      xFormOpt.data.manufacturer = ""
      xFormOpt.data.description = ""
      xFormOpt.data.aspect_ratio = []
      syncAspectRatioOptions()
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
      const points = normalizeInteger(xFormOpt.data.consume_points)
      const modelKey = xFormOpt.data.model_key.trim()
      const manufacturer = xFormOpt.data.manufacturer.trim()
      const description = xFormOpt.data.description.trim()
      const payload = {
        name: xFormOpt.data.name.trim(),
        model_key: modelKey || undefined,
        manufacturer: manufacturer || undefined,
        description: description || undefined,
        aspect_ratios: sortAspectRatios(normalizeAspectRatios(xFormOpt.data.aspect_ratio)),
        status: normalizeStatus(xFormOpt.data.status),
        consume_points: points
      }
      const callback = () => {
        xFormOpt.loading = false
        xModalDom.value?.close()
        ElMessage.success(textMap.success)
        !crudStore.isUpdate && crudStore.afterInsert()
        crudStore.commitQuery()
      }
      const request = crudStore.isUpdate
        ? updateModelApi({
            id: xFormOpt.data.id,
            ...payload
          })
        : createModelApi(payload)
      request.then(callback).catch(() => {
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
  },
  goSkuPage: (row) => {
    router.push({
      path: `/modelManagement/skus/${row.id}`,
      query: {
        modelName: row.name
      }
    })
  },
  onChangeSortOrder: (row, currentValue, oldValue) => {
    const nextSortOrder = normalizeInteger(currentValue)
    const previousSortOrder = normalizeInteger(oldValue)
    if (nextSortOrder === undefined) {
      ElMessage.error(textMap.invalidSortOrder)
      row.sort_order = previousSortOrder ?? 0
      return
    }
    if (nextSortOrder === previousSortOrder) return
    updateModelSortApi({
      id: row.id,
      sort_order: nextSortOrder
    }).then(() => {
      ElMessage.success(textMap.success)
      crudStore.commitQuery()
    }).catch(() => {
      row.sort_order = previousSortOrder ?? 0
    })
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
  titleWidth: "120px",
  loading: false,
  titleColon: false,
  data: {
    id: undefined,
    name: "",
    model_key: "",
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
          if (normalizeInteger(itemValue) === undefined) {
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
      field: "model_key",
      title: textMap.modelKey,
      itemRender: {
        name: "$input",
        props: {
          placeholder: textMap.inputModelKey
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
      <template #aspect-ratio-column="{ row }">
        <span>{{ getAspectRatioText(row) }}</span>
      </template>
      <template #sort-order-column="{ row }">
        <el-input-number
          class="sort-order-input"
          v-model="row.sort_order"
          :min="0"
          :step="1"
          :precision="0"
          controls-position="right"
          @change="(currentValue, oldValue) => crudStore.onChangeSortOrder(row, currentValue, oldValue)"
        />
      </template>
      <template #status-column="{ row, column }">
        <el-tag :type="Number(row[column.field]) === 1 ? 'success' : 'info'" effect="plain">
          {{ Number(row[column.field]) === 1 ? textMap.enabled : textMap.disabled }}
        </el-tag>
      </template>
      <template #row-operate="{ row }">
        <el-button link type="success" @click="crudStore.goSkuPage(row)">
          {{ textMap.skuAction }}
        </el-button>
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
            <el-checkbox v-for="item in aspectRatioOptions" :key="item" :value="item">
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

<style lang="sass" scoped>
:deep(.sort-order-input)
  width: 100%
</style>
