<script setup>
import { getToken } from "@@/utils/local-storage"
import { Delete, Plus } from "@element-plus/icons-vue"
import { createPromptLibraryApi, deletePromptLibraryApi, getPromptLibrariesApi, updatePromptLibraryApi, updatePromptLibrarySortApi } from "@/common/apis/prompt-libraries"
import { resolveCosImageUrl } from "@/common/constants/image"

const textMap = {
  searchPlaceholder: "请输入提示词或标签",
  search: "查询",
  reset: "重置",
  add: "新增提示词",
  edit: "编辑提示词",
  create: "新增提示词",
  image: "配图",
  prompt: "提示词",
  tag: "标签",
  sortOrder: "排序",
  status: "状态",
  enabled: "启用",
  disabled: "停用",
  updatedAt: "更新时间",
  action: "操作",
  editAction: "编辑",
  deleteAction: "删除",
  copyAction: "复制",
  promptDetail: "提示词详情",
  confirmTitle: "提示",
  confirmDelete: prompt => `确定 <strong style=\"color: var(--el-color-danger);\"> 删除 </strong> 提示词 <strong style=\"color: var(--el-color-primary);\"> ${prompt} </strong> 吗？`,
  cancel: "取消",
  confirm: "确定",
  success: "操作成功",
  deleteSuccess: "删除成功",
  copySuccess: "已复制提示词",
  copyFailed: "复制失败，请手动复制",
  inputPrompt: "请输入提示词内容",
  inputTag: "请输入标签",
  inputStatus: "请选择状态",
  inputSortOrder: "请输入排序值",
  uploadSuccess: "上传成功",
  uploadFailed: "上传失败",
  uploadTypeError: "只能上传图片格式文件",
  uploadSizeError: "上传图片大小不能超过 20MB",
  invalidBlank: "空格无效",
  noPrompt: "暂无提示词"
}

function normalizeText(value) {
  if (value === undefined || value === null) return ""
  return String(value).trim()
}

function normalizeStatus(value) {
  return Number(value) === 0 ? 0 : 1
}

function getQueryStatus(value) {
  if (value === 0 || value === "0") return 0
  if (value === 1 || value === "1") return 1
  return undefined
}

function normalizeSortOrder(value) {
  const num = Number(value)
  return Number.isFinite(num) ? Math.trunc(num) : 0
}

function getPromptPreview(value) {
  const text = normalizeText(value)
  if (!text) return "-"
  return text.length > 80 ? `${text.slice(0, 80)}...` : text
}

function normalizeImageUrl(value) {
  return normalizeText(value)
}

function getRenderImageUrl(value) {
  return resolveCosImageUrl(normalizeImageUrl(value))
}

const statusOptions = [
  { label: textMap.enabled, value: 1 },
  { label: textMap.disabled, value: 0 }
]

const queryStatusOptions = [
  { label: "全部状态", value: "" },
  ...statusOptions
]

const promptDialog = reactive({
  visible: false,
  content: ""
})

const xGridDom = useTemplateRef("xGridDom")
const xGridOpt = reactive({
  loading: false,
  autoResize: true,
  pagerConfig: {
    align: "right"
  },
  formConfig: {
    items: [
      {
        field: "keyword",
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
    { type: "seq", width: "60px" },
    {
      field: "image_url",
      title: textMap.image,
      width: "110px",
      slots: {
        default: "image-column"
      }
    },
    {
      field: "prompt",
      title: textMap.prompt,
      minWidth: "360px",
      slots: {
        default: "prompt-column"
      }
    },
    {
      field: "tag",
      title: textMap.tag,
      minWidth: "180px",
      slots: {
        default: "tag-column"
      }
    },
    {
      field: "sort_order",
      title: textMap.sortOrder,
      width: "100px"
    },
    {
      field: "status",
      title: textMap.status,
      width: "100px",
      slots: {
        default: "status-column"
      }
    },
    { field: "updated_at", title: textMap.updatedAt, width: "180px" },
    {
      title: textMap.action,
      width: "180px",
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
      query: async ({ page, form }) => {
        xGridOpt.loading = true
        try {
          const params = {
            page: page.currentPage,
            pageSize: page.pageSize,
            keyword: normalizeText(form?.keyword) || undefined,
            status: getQueryStatus(form?.status)
          }
          const response = await getPromptLibrariesApi(params)
          return {
            total: response?.data?.total || 0,
            result: response?.data?.list || []
          }
        } finally {
          xGridOpt.loading = false
        }
      }
    }
  }
})

const crudStore = reactive({
  isUpdate: true,
  commitQuery: () => xGridDom.value?.commitProxy("query"),
  onShowModal: (row) => {
    uploadFileList.value = []
    uploadLoading.value = false
    if (row) {
      crudStore.isUpdate = true
      xModalOpt.title = textMap.edit
      xFormOpt.data.id = row.id
      xFormOpt.data.image_url = normalizeImageUrl(row.image_url)
      xFormOpt.data.prompt = row.prompt || ""
      xFormOpt.data.tag = row.tag || ""
      xFormOpt.data.status = normalizeStatus(row.status)
      xFormOpt.data.sort_order = normalizeSortOrder(row.sort_order)
      xFormOpt.data.original_sort_order = normalizeSortOrder(row.sort_order)
    } else {
      crudStore.isUpdate = false
      xModalOpt.title = textMap.create
      xFormOpt.data.id = undefined
      xFormOpt.data.image_url = ""
      xFormOpt.data.prompt = ""
      xFormOpt.data.tag = ""
      xFormOpt.data.status = 1
      xFormOpt.data.sort_order = 0
      xFormOpt.data.original_sort_order = 0
    }
    xModalDom.value?.open()
    nextTick(() => {
      xFormDom.value?.clearValidate()
    })
  },
  onSubmitForm: () => {
    if (xFormOpt.loading) return
    xFormDom.value?.validate(async (errMap) => {
      if (errMap) return
      xFormOpt.loading = true
      try {
        const payload = {
          image_url: normalizeImageUrl(xFormOpt.data.image_url),
          prompt: normalizeText(xFormOpt.data.prompt),
          tag: normalizeText(xFormOpt.data.tag),
          sort_order: normalizeSortOrder(xFormOpt.data.sort_order),
          status: normalizeStatus(xFormOpt.data.status)
        }
        if (crudStore.isUpdate && xFormOpt.data.id !== undefined) {
          await updatePromptLibraryApi({
            id: xFormOpt.data.id,
            ...payload
          })
          if (payload.sort_order !== xFormOpt.data.original_sort_order) {
            await updatePromptLibrarySortApi({
              id: xFormOpt.data.id,
              sort_order: payload.sort_order
            })
          }
        } else {
          await createPromptLibraryApi(payload)
        }
        xModalDom.value?.close()
        ElMessage.success(textMap.success)
        crudStore.commitQuery()
      } finally {
        xFormOpt.loading = false
      }
    })
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
    ElMessageBox.confirm(textMap.confirmDelete(getPromptPreview(row.prompt)), textMap.confirmTitle, config).then(async () => {
      await deletePromptLibraryApi(row.id)
      ElMessage.success(textMap.deleteSuccess)
      crudStore.commitQuery()
    })
  },
  onCopy: async (row) => {
    try {
      await navigator.clipboard.writeText(row.prompt || "")
      ElMessage.success(textMap.copySuccess)
    } catch {
      ElMessage.error(textMap.copyFailed)
    }
  }
})

const xModalDom = useTemplateRef("xModalDom")
const xModalOpt = reactive({
  title: "",
  showClose: true,
  escClosable: true,
  maskClosable: true,
  width: "720px",
  beforeHideMethod: () => {
    xFormDom.value?.clearValidate()
    return Promise.resolve()
  }
})

const uploadFileList = ref([])
const uploadLoading = ref(false)
const uploadAction = `${import.meta.env.VITE_BASE_URL}/admin/images/upload`

function beforeUpload(file) {
  const isImage = file.type.startsWith("image/")
  const isLt20M = file.size / 1024 / 1024 < 20
  if (!isImage) {
    ElMessage.error(textMap.uploadTypeError)
    return false
  }
  if (!isLt20M) {
    ElMessage.error(textMap.uploadSizeError)
    return false
  }
  return true
}

function handleUploadSuccess(response) {
  uploadLoading.value = false
  if (response?.data?.url) {
    xFormOpt.data.image_url = response.data.url
    ElMessage.success(textMap.uploadSuccess)
  }
}

function handleUploadError() {
  uploadLoading.value = false
  ElMessage.error(textMap.uploadFailed)
}

function handleUploadChange(file, fileList) {
  uploadFileList.value = fileList
  if (file.status === "uploading") {
    uploadLoading.value = true
  }
}

function handleRemoveImage() {
  xFormOpt.data.image_url = ""
  uploadFileList.value = []
  uploadLoading.value = false
}

const xFormDom = useTemplateRef("xFormDom")
const xFormOpt = reactive({
  span: 24,
  titleWidth: "90px",
  loading: false,
  titleColon: false,
  data: {
    id: undefined,
    image_url: "",
    prompt: "",
    tag: "",
    status: 1,
    sort_order: 0,
    original_sort_order: 0
  },
  rules: {
    prompt: [
      {
        required: true,
        validator: ({ itemValue }) => {
          switch (true) {
            case !itemValue:
              return new Error(textMap.inputPrompt)
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
    sort_order: [
      {
        required: true,
        validator: ({ itemValue }) => {
          if (!Number.isInteger(Number(itemValue))) {
            return new Error(textMap.inputSortOrder)
          }
        }
      }
    ]
  },
  items: [
    {
      field: "image_url",
      title: textMap.image,
      slots: {
        default: "upload-slot"
      }
    },
    {
      field: "prompt",
      title: textMap.prompt,
      itemRender: {
        name: "$input",
        props: {
          placeholder: textMap.inputPrompt,
          type: "textarea",
          rows: 6
        }
      }
    },
    {
      field: "tag",
      title: textMap.tag,
      itemRender: {
        name: "$input",
        props: {
          placeholder: textMap.inputTag
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
          placeholder: textMap.inputSortOrder
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

function openPromptDialog(row) {
  promptDialog.content = normalizeText(row?.prompt) || textMap.noPrompt
  promptDialog.visible = true
}
</script>

<template>
  <div class="app-container prompt-library">
    <vxe-grid ref="xGridDom" v-bind="xGridOpt">
      <template #toolbar-btns>
        <vxe-button status="primary" icon="vxe-icon-add" @click="crudStore.onShowModal()">
          {{ textMap.add }}
        </vxe-button>
      </template>
      <template #prompt-column="{ row }">
        <div class="prompt-cell">
          <span class="prompt-text">{{ getPromptPreview(row.prompt) }}</span>
          <el-button v-if="row.prompt" link type="primary" @click="openPromptDialog(row)">
            查看详情
          </el-button>
        </div>
      </template>
      <template #image-column="{ row }">
        <el-image
          v-if="row.image_url"
          :src="getRenderImageUrl(row.image_url)"
          :preview-src-list="[getRenderImageUrl(row.image_url)]"
          fit="cover"
          class="thumb-image"
          preview-teleported
        />
        <span v-else>-</span>
      </template>
      <template #tag-column="{ row }">
        <el-tag v-if="row.tag" effect="plain" size="small">
          {{ row.tag }}
        </el-tag>
        <span v-else>-</span>
      </template>
      <template #status-column="{ row }">
        <el-tag :type="normalizeStatus(row.status) === 1 ? 'success' : 'info'" effect="plain">
          {{ normalizeStatus(row.status) === 1 ? textMap.enabled : textMap.disabled }}
        </el-tag>
      </template>
      <template #row-operate="{ row }">
        <el-button link type="success" @click="crudStore.onCopy(row)">
          {{ textMap.copyAction }}
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
        <template #upload-slot>
          <div v-if="xFormOpt.data.image_url" class="upload-preview">
            <el-image :src="getRenderImageUrl(xFormOpt.data.image_url)" fit="cover" class="upload-preview-image" />
            <el-button type="danger" size="small" :icon="Delete" circle class="remove-upload-btn" @click="handleRemoveImage" />
          </div>
          <el-upload
            v-else
            v-model:file-list="uploadFileList"
            :action="uploadAction"
            :headers="{ Authorization: `Bearer ${getToken()}` }"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-change="handleUploadChange"
            :limit="1"
            list-type="picture-card"
            accept="image/*"
          >
            <el-icon>
              <Plus />
            </el-icon>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg/png/gif/webp，文件大小不超过 20MB
              </div>
            </template>
          </el-upload>
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

    <el-dialog v-model="promptDialog.visible" :title="textMap.promptDetail" width="680px" append-to-body>
      <div class="prompt-detail">
        {{ promptDialog.content }}
      </div>
      <template #footer>
        <el-button type="primary" @click="promptDialog.visible = false">
          {{ textMap.confirm }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.prompt-cell {
  display: flex;
  justify-content: center;
  gap: 8px;
  align-items: center;
}

.prompt-text {
  max-width: 270px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prompt-detail {
  white-space: pre-wrap;
  line-height: 1.6;
  word-break: break-word;
}

.thumb-image {
  width: 56px;
  height: 56px;
  border-radius: 6px;
}

.upload-preview {
  position: relative;
  display: inline-block;
}

.upload-preview-image {
  width: 148px;
  height: 148px;
  border-radius: 6px;
}

.remove-upload-btn {
  position: absolute;
  top: -8px;
  right: -8px;
}
</style>
