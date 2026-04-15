<script setup>
import { getModelDetailApi } from "@/common/apis/models"
import {
  createModelSkuApi,
  deleteModelSkuApi,
  getModelSkuApi,
  setDefaultModelSkuApi,
  updateModelSkuApi
} from "@/common/apis/models/sku"

const route = useRoute()
const router = useRouter()

const textMap = {
  title: "SKU 管理",
  back: "返回模型列表",
  refresh: "刷新",
  add: "新增 SKU",
  search: "查询",
  reset: "重置",
  allStatus: "全部状态",
  enabled: "启用",
  disabled: "停用",
  default: "默认",
  nonDefault: "非默认",
  skuCode: "SKU 编码",
  skuName: "SKU 名称",
  sizeMode: "尺寸模式",
  sizeValue: "尺寸值",
  resolution: "分辨率",
  imageSize: "图片档位",
  consumePoints: "消耗积分",
  sortOrder: "排序",
  status: "状态",
  isDefault: "默认 SKU",
  createdAt: "创建时间",
  action: "操作",
  editAction: "编辑",
  deleteAction: "删除",
  setDefaultAction: "设为默认",
  edit: "编辑 SKU",
  create: "新增 SKU",
  confirm: "确定",
  cancel: "取消",
  success: "操作成功",
  deleteSuccess: "删除成功",
  confirmTitle: "提示",
  confirmDelete: name => `确定 <strong style=\"color: var(--el-color-danger);\"> 删除 </strong> SKU <strong style=\"color: var(--el-color-primary);\"> ${name} </strong> 吗？`,
  confirmDefault: name => `确定将 <strong style=\"color: var(--el-color-primary);\"> ${name} </strong> 设为默认 SKU 吗？`,
  modelLabel: "当前模型",
  modelId: "模型ID",
  modelKey: "模型Key",
  modelPoints: "模型默认积分",
  inputSkuCode: "请输入 SKU 编码",
  inputSkuName: "请输入 SKU 名称",
  inputSizeMode: "请选择尺寸模式",
  inputResolution: "请输入分辨率，例如 1024x1024",
  invalidResolution: "分辨率格式必须是 1024x1024",
  inputImageSize: "请选择图片档位",
  inputConsumePoints: "请输入消耗积分",
  inputSortOrder: "请输入排序值",
  inputStatus: "请选择状态",
  inputDefault: "请选择是否默认",
  invalidBlank: "空格无效",
  invalidNonNegativeInt: "必须是大于等于 0 的整数",
  invalidModelId: "模型ID无效，无法加载 SKU"
}

const queryStatusOptions = [
  { label: textMap.allStatus, value: "" },
  { label: textMap.enabled, value: 1 },
  { label: textMap.disabled, value: 0 }
]

const statusOptions = [
  { label: textMap.enabled, value: 1 },
  { label: textMap.disabled, value: 0 }
]

const yesNoOptions = [
  { label: "是", value: 1 },
  { label: "否", value: 0 }
]

const sizeModeOptions = [
  { label: "分辨率模式", value: "resolution" },
  { label: "档位模式", value: "image_size" }
]

const modelId = computed(() => Number(route.params.modelId))
const modelNameFromQuery = computed(() => {
  if (!route.query.modelName) return ""
  return String(route.query.modelName)
})
const isValidModelId = computed(() => Number.isInteger(modelId.value) && modelId.value > 0)

const modelProfile = reactive({
  name: "",
  model_key: "",
  consume_points: "-"
})

const pageTitle = computed(() => {
  return modelProfile.name || modelNameFromQuery.value || `${textMap.title}`
})

function normalizeStatus(value) {
  return Number(value) === 0 ? 0 : 1
}

function normalizeInteger(value) {
  if (value === undefined || value === null || value === "") return undefined
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) return undefined
  return parsed
}

function normalizeSizeMode(value) {
  return value === "image_size" ? "image_size" : "resolution"
}

function normalizeImageSize(value) {
  if (!value) return ""
  return String(value).trim().toUpperCase()
}

function getSkuSizeValue(row) {
  if (row.size_mode === "image_size") {
    return row.image_size || "-"
  }
  return row.resolution || "-"
}

function goBack() {
  router.push("/modelManagement/list")
}

async function loadModelDetail() {
  if (!isValidModelId.value) return
  const { data } = await getModelDetailApi(modelId.value)
  modelProfile.name = data.name || ""
  modelProfile.model_key = data.model_key || "-"
  modelProfile.consume_points = data.consume_points ?? "-"
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
      field: "sku_code",
      title: textMap.skuCode,
      minWidth: "160px"
    },
    {
      field: "sku_name",
      title: textMap.skuName,
      minWidth: "160px"
    },
    {
      field: "size_mode",
      title: textMap.sizeMode,
      width: "120px",
      slots: {
        default: "size-mode-column"
      }
    },
    {
      field: "size_value",
      title: textMap.sizeValue,
      width: "140px",
      slots: {
        default: "size-value-column"
      }
    },
    {
      field: "consume_points",
      title: textMap.consumePoints,
      width: "110px"
    },
    {
      field: "sort_order",
      title: textMap.sortOrder,
      width: "90px"
    },
    {
      field: "is_default",
      title: textMap.isDefault,
      width: "120px",
      slots: {
        default: "default-column"
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
      width: "230px",
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
          if (!isValidModelId.value) {
            ElMessage.error(textMap.invalidModelId)
            callback({ data: { total: 0, list: [] } })
            return
          }
          const params = {
            pageSize: page.pageSize,
            page: page.currentPage
          }
          if (form.status !== "" && form.status !== undefined && form.status !== null) {
            params.status = normalizeStatus(form.status)
          }
          getModelSkuApi(modelId.value, params).then(callback).catch(callback)
        })
      }
    }
  }
})

const crudStore = reactive({
  isUpdate: true,
  commitQuery: () => xGridDom.value?.commitProxy("query"),
  clearTable: () => xGridDom.value?.reloadData([]),
  onSizeModeChange: () => {
    if (xFormOpt.data.size_mode === "resolution") {
      xFormOpt.data.image_size = ""
    } else {
      xFormOpt.data.resolution = ""
      if (!xFormOpt.data.image_size) {
        xFormOpt.data.image_size = "1K"
      }
    }
  },
  onShowModal: (row) => {
    if (row) {
      crudStore.isUpdate = true
      xModalOpt.title = textMap.edit
      xFormOpt.data.id = row.id
      xFormOpt.data.sku_code = row.sku_code || ""
      xFormOpt.data.sku_name = row.sku_name || ""
      xFormOpt.data.size_mode = normalizeSizeMode(row.size_mode)
      xFormOpt.data.resolution = row.resolution || ""
      xFormOpt.data.image_size = normalizeImageSize(row.image_size)
      xFormOpt.data.consume_points = normalizeInteger(row.consume_points)
      xFormOpt.data.is_default = normalizeStatus(row.is_default)
      xFormOpt.data.status = normalizeStatus(row.status)
      xFormOpt.data.sort_order = normalizeInteger(row.sort_order)
    } else {
      crudStore.isUpdate = false
      xModalOpt.title = textMap.create
      xFormOpt.data.id = undefined
      xFormOpt.data.sku_code = ""
      xFormOpt.data.sku_name = ""
      xFormOpt.data.size_mode = "resolution"
      xFormOpt.data.resolution = "1024x1024"
      xFormOpt.data.image_size = ""
      xFormOpt.data.consume_points = undefined
      xFormOpt.data.is_default = 0
      xFormOpt.data.status = 1
      xFormOpt.data.sort_order = 0
    }
    xModalDom.value?.open()
    nextTick(() => {
      xFormDom.value?.clearValidate()
    })
  },
  onSubmitForm: () => {
    if (xFormOpt.loading || !isValidModelId.value) return
    xFormDom.value?.validate((errMap) => {
      if (errMap) return
      xFormOpt.loading = true
      const sizeMode = normalizeSizeMode(xFormOpt.data.size_mode)
      const payload = {
        sku_code: xFormOpt.data.sku_code.trim(),
        sku_name: xFormOpt.data.sku_name.trim(),
        size_mode: sizeMode,
        resolution: sizeMode === "resolution" ? xFormOpt.data.resolution.trim() : undefined,
        image_size: sizeMode === "image_size" ? normalizeImageSize(xFormOpt.data.image_size) : undefined,
        consume_points: normalizeInteger(xFormOpt.data.consume_points),
        is_default: normalizeStatus(xFormOpt.data.is_default),
        status: normalizeStatus(xFormOpt.data.status),
        sort_order: normalizeInteger(xFormOpt.data.sort_order)
      }
      const callback = () => {
        xFormOpt.loading = false
        xModalDom.value?.close()
        ElMessage.success(textMap.success)
        !crudStore.isUpdate && crudStore.afterInsert()
        crudStore.commitQuery()
      }
      const request = crudStore.isUpdate
        ? updateModelSkuApi(modelId.value, xFormOpt.data.id, payload)
        : createModelSkuApi(modelId.value, payload)
      request.then(callback).catch(() => {
        xFormOpt.loading = false
      })
    })
  },
  onSetDefault: (row) => {
    if (!isValidModelId.value) return
    if (normalizeStatus(row.status) !== 1) {
      ElMessage.warning("仅启用状态 SKU 才能设为默认")
      return
    }
    const config = {
      type: "warning",
      showClose: true,
      closeOnClickModal: true,
      closeOnPressEscape: true,
      cancelButtonText: textMap.cancel,
      confirmButtonText: textMap.confirm,
      dangerouslyUseHTMLString: true
    }
    ElMessageBox.confirm(textMap.confirmDefault(row.sku_name || row.sku_code), textMap.confirmTitle, config).then(() => {
      setDefaultModelSkuApi(modelId.value, row.id).then(() => {
        ElMessage.success(textMap.success)
        crudStore.commitQuery()
      })
    })
  },
  onDelete: (row) => {
    if (!isValidModelId.value) return
    const config = {
      type: "warning",
      showClose: true,
      closeOnClickModal: true,
      closeOnPressEscape: true,
      cancelButtonText: textMap.cancel,
      confirmButtonText: textMap.confirm,
      dangerouslyUseHTMLString: true
    }
    ElMessageBox.confirm(textMap.confirmDelete(row.sku_name || row.sku_code), textMap.confirmTitle, config).then(() => {
      deleteModelSkuApi(modelId.value, row.id).then(() => {
        ElMessage.success(textMap.deleteSuccess)
        crudStore.afterDelete()
        crudStore.commitQuery()
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
  titleWidth: "110px",
  loading: false,
  titleColon: false,
  data: {
    id: undefined,
    sku_code: "",
    sku_name: "",
    size_mode: "resolution",
    resolution: "1024x1024",
    image_size: "",
    consume_points: undefined,
    is_default: 0,
    status: 1,
    sort_order: 0
  },
  rules: {
    sku_code: [
      {
        required: true,
        validator: ({ itemValue }) => {
          switch (true) {
            case !itemValue:
              return new Error(textMap.inputSkuCode)
            case !itemValue.trim():
              return new Error(textMap.invalidBlank)
          }
        }
      }
    ],
    sku_name: [
      {
        required: true,
        validator: ({ itemValue }) => {
          switch (true) {
            case !itemValue:
              return new Error(textMap.inputSkuName)
            case !itemValue.trim():
              return new Error(textMap.invalidBlank)
          }
        }
      }
    ],
    size_mode: [
      {
        required: true,
        validator: ({ itemValue }) => {
          if (!["resolution", "image_size"].includes(itemValue)) {
            return new Error(textMap.inputSizeMode)
          }
        }
      }
    ],
    resolution: [
      {
        validator: ({ itemValue }) => {
          if (xFormOpt.data.size_mode !== "resolution") return
          const value = itemValue?.trim?.() || ""
          if (!value) {
            return new Error(textMap.inputResolution)
          }
          if (!/^\d+x\d+$/.test(value)) {
            return new Error(textMap.invalidResolution)
          }
        }
      }
    ],
    image_size: [
      {
        validator: ({ itemValue }) => {
          if (xFormOpt.data.size_mode !== "image_size") return
          if (!["1K", "2K", "4K"].includes(normalizeImageSize(itemValue))) {
            return new Error(textMap.inputImageSize)
          }
        }
      }
    ],
    consume_points: [
      {
        required: true,
        validator: ({ itemValue }) => {
          if (normalizeInteger(itemValue) === undefined) {
            return new Error(textMap.invalidNonNegativeInt)
          }
        }
      }
    ],
    sort_order: [
      {
        required: true,
        validator: ({ itemValue }) => {
          if (normalizeInteger(itemValue) === undefined) {
            return new Error(textMap.invalidNonNegativeInt)
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
    is_default: [
      {
        required: true,
        validator: ({ itemValue }) => {
          if (![0, 1].includes(Number(itemValue))) {
            return new Error(textMap.inputDefault)
          }
        }
      }
    ]
  },
  items: [
    {
      field: "sku_code",
      title: textMap.skuCode,
      itemRender: {
        name: "$input",
        props: {
          placeholder: textMap.inputSkuCode
        }
      }
    },
    {
      field: "sku_name",
      title: textMap.skuName,
      itemRender: {
        name: "$input",
        props: {
          placeholder: textMap.inputSkuName
        }
      }
    },
    {
      field: "size_mode",
      title: textMap.sizeMode,
      slots: {
        default: "size-mode-slot"
      }
    },
    {
      field: "resolution",
      title: textMap.resolution,
      visibleMethod: ({ data }) => data.size_mode === "resolution",
      itemRender: {
        name: "$input",
        props: {
          placeholder: textMap.inputResolution
        }
      }
    },
    {
      field: "image_size",
      title: textMap.imageSize,
      visibleMethod: ({ data }) => data.size_mode === "image_size",
      slots: {
        default: "image-size-slot"
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
      field: "sort_order",
      title: textMap.sortOrder,
      itemRender: {
        name: "$input",
        props: {
          type: "number",
          min: 0,
          placeholder: textMap.inputSortOrder
        }
      }
    },
    {
      field: "is_default",
      title: textMap.isDefault,
      slots: {
        default: "default-slot"
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

onMounted(async () => {
  if (!isValidModelId.value) {
    ElMessage.error(textMap.invalidModelId)
    return
  }
  await loadModelDetail()
})
</script>

<template>
  <div class="app-container sku-management">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div>
            <h3>{{ pageTitle }} {{ textMap.title }}</h3>
            <div class="meta">
              <el-tag>{{ textMap.modelId }}：{{ modelId }}</el-tag>
              <el-tag type="info">{{ textMap.modelKey }}：{{ modelProfile.model_key }}</el-tag>
              <el-tag type="success">{{ textMap.modelPoints }}：{{ modelProfile.consume_points }}</el-tag>
            </div>
          </div>
          <div class="header-actions">
            <el-button @click="goBack">
              {{ textMap.back }}
            </el-button>
            <el-button type="primary" plain @click="crudStore.commitQuery()">
              {{ textMap.refresh }}
            </el-button>
          </div>
        </div>
      </template>

      <vxe-grid ref="xGridDom" v-bind="xGridOpt">
        <template #toolbar-btns>
          <vxe-button status="primary" icon="vxe-icon-add" @click="crudStore.onShowModal()">
            {{ textMap.add }}
          </vxe-button>
        </template>
        <template #size-mode-column="{ row }">
          <el-tag type="warning" effect="plain">
            {{ row.size_mode === "image_size" ? "档位" : "分辨率" }}
          </el-tag>
        </template>
        <template #size-value-column="{ row }">
          {{ getSkuSizeValue(row) }}
        </template>
        <template #default-column="{ row, column }">
          <el-tag :type="Number(row[column.field]) === 1 ? 'success' : 'info'" effect="plain">
            {{ Number(row[column.field]) === 1 ? textMap.default : textMap.nonDefault }}
          </el-tag>
        </template>
        <template #status-column="{ row, column }">
          <el-tag :type="Number(row[column.field]) === 1 ? 'success' : 'info'" effect="plain">
            {{ Number(row[column.field]) === 1 ? textMap.enabled : textMap.disabled }}
          </el-tag>
        </template>
        <template #row-operate="{ row }">
          <el-button link type="success" :disabled="Number(row.is_default) === 1" @click="crudStore.onSetDefault(row)">
            {{ textMap.setDefaultAction }}
          </el-button>
          <el-button link type="primary" @click="crudStore.onShowModal(row)">
            {{ textMap.editAction }}
          </el-button>
          <el-button link type="danger" @click="crudStore.onDelete(row)">
            {{ textMap.deleteAction }}
          </el-button>
        </template>
      </vxe-grid>
    </el-card>

    <vxe-modal ref="xModalDom" v-bind="xModalOpt">
      <vxe-form ref="xFormDom" v-bind="xFormOpt">
        <template #size-mode-slot>
          <el-radio-group v-model="xFormOpt.data.size_mode" @change="crudStore.onSizeModeChange()">
            <el-radio v-for="item in sizeModeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </template>
        <template #image-size-slot>
          <el-select
            v-model="xFormOpt.data.image_size"
            :placeholder="textMap.inputImageSize"
            style="width: 100%"
            :teleported="false"
            popper-class="sku-image-size-popper"
          >
            <el-option label="1k" value="1K">
              1k
            </el-option>
            <el-option label="2k" value="2K">
              2k
            </el-option>
            <el-option label="4k" value="4K">
              4k
            </el-option>
          </el-select>
        </template>
        <template #default-slot>
          <el-radio-group v-model="xFormOpt.data.is_default">
            <el-radio v-for="item in yesNoOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
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

<style lang="scss" scoped>
.sku-management {
  display: grid;
  gap: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;

  h3 {
    margin: 0;
  }
}

.meta {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

:deep(.sku-image-size-popper) {
  z-index: 10000 !important;
}
</style>
