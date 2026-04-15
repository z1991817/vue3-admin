<script setup>
import {
  getImageGenerationRecordsApi,
  setGalleryFromGenerationRecordApi,
  unsetGalleryFromGenerationRecordApi
} from "@/common/apis/image-generation-records"

const textMap = {
  pageTitle: "生图记录",
  search: "查询",
  reset: "重置",
  userId: "用户ID",
  username: "用户名",
  generationType: "生成类型",
  status: "状态",
  prompt: "提示词",
  createdAt: "创建时间",
  model: "模型",
  size: "尺寸",
  cosUrl: "COS地址",
  action: "操作",
  setGalleryAction: "设为画廊图",
  unsetGalleryAction: "取消画廊图",
  promptDetail: "提示词详情",
  confirm: "确定",
  refresh: "刷新",
  placeholderUserId: "请输入用户ID",
  placeholderUsername: "请输入用户名",
  placeholderGenerationType: "请输入生成类型",
  placeholderStatus: "请输入状态",
  noPrompt: "暂无提示词",
  operationSuccess: "操作成功",
  setGalleryFailedTip: "当前记录缺少可入库图片地址"
}

function normalizeOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return undefined
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined
  return parsed
}

function normalizeOptionalText(value) {
  if (value === undefined || value === null) return undefined
  const text = String(value).trim()
  return text || undefined
}

function getPromptPreview(value) {
  const text = normalizeOptionalText(value)
  if (!text) return "-"
  return text.length > 80 ? `${text.slice(0, 80)}...` : text
}

function getStatusTagType(status) {
  if (!status) return "info"
  if (status === "uploaded" || status === "success") return "success"
  if (status === "failed") return "danger"
  if (status === "pending" || status === "processing") return "warning"
  return "info"
}

function canSetGallery(row) {
  return Boolean(normalizeOptionalText(row?.cos_url) || normalizeOptionalText(row?.third_party_url))
}

function isInGallery(row) {
  return Boolean(row?.is_in_gallery)
}

function getGalleryActionLabel(row) {
  return isInGallery(row) ? textMap.unsetGalleryAction : textMap.setGalleryAction
}

function canToggleGallery(row) {
  if (isInGallery(row)) return true
  return canSetGallery(row)
}

const promptDialog = reactive({
  visible: false,
  content: ""
})

function openPromptDialog(row) {
  promptDialog.content = normalizeOptionalText(row?.prompt) || textMap.noPrompt
  promptDialog.visible = true
}

const setGalleryLoadingId = ref(undefined)
async function toggleGallery(row) {
  const inGallery = isInGallery(row)
  if (!inGallery && !canSetGallery(row)) {
    ElMessage.warning(textMap.setGalleryFailedTip)
    return
  }
  if (setGalleryLoadingId.value === row.id) return
  setGalleryLoadingId.value = row.id
  try {
    const res = inGallery
      ? await unsetGalleryFromGenerationRecordApi(row.id)
      : await setGalleryFromGenerationRecordApi(row.id, {})
    const imageId = !inGallery ? res?.data?.imageId : undefined
    const message = res?.message || textMap.operationSuccess
    ElMessage.success(imageId ? `${message}（imageId: ${imageId}）` : message)
    xGridDom.value?.commitProxy("query")
  } finally {
    setGalleryLoadingId.value = undefined
  }
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
        field: "userId",
        itemRender: {
          name: "VxeInput",
          props: {
            placeholder: textMap.placeholderUserId,
            clearable: true
          }
        }
      },
      {
        field: "username",
        itemRender: {
          name: "VxeInput",
          props: {
            placeholder: textMap.placeholderUsername,
            clearable: true
          }
        }
      },
      {
        field: "generation_type",
        itemRender: {
          name: "VxeInput",
          props: {
            placeholder: textMap.placeholderGenerationType,
            clearable: true
          }
        }
      },
      {
        field: "status",
        itemRender: {
          name: "VxeInput",
          props: {
            placeholder: textMap.placeholderStatus,
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
    { field: "id", title: "ID", width: "80px" },
    { field: "user_id", title: textMap.userId, width: "90px" },
    { field: "username", title: textMap.username, minWidth: "120px" },
    { field: "generation_type", title: textMap.generationType, minWidth: "140px" },
    { field: "model", title: textMap.model, minWidth: "140px" },
    { field: "size", title: textMap.size, width: "110px" },
    {
      field: "status",
      title: textMap.status,
      width: "110px",
      slots: {
        default: "status-column"
      }
    },
    {
      field: "prompt",
      title: textMap.prompt,
      minWidth: "360px",
      align: "center",
      slots: {
        default: "prompt-column"
      }
    },
    {
      field: "cos_url",
      title: textMap.cosUrl,
      minWidth: "180px",
      align: "center",
      slots: {
        default: "cos-url-column"
      }
    },
    { field: "created_at", title: textMap.createdAt, width: "180px" },
    {
      title: textMap.action,
      width: "150px",
      fixed: "right",
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
          const params = {
            page: page.currentPage,
            pageSize: page.pageSize
          }
          const userId = normalizeOptionalNumber(form.userId)
          const username = normalizeOptionalText(form.username)
          const generationType = normalizeOptionalText(form.generation_type)
          const status = normalizeOptionalText(form.status)
          if (userId !== undefined) params.userId = userId
          if (username !== undefined) params.username = username
          if (generationType !== undefined) params.generation_type = generationType
          if (status !== undefined) params.status = status
          getImageGenerationRecordsApi(params).then(callback).catch(callback)
        })
      }
    }
  }
})
</script>

<template>
  <div class="app-container generation-records">
    <vxe-grid ref="xGridDom" v-bind="xGridOpt">
      <template #toolbar-btns>
        <vxe-button status="primary" icon="vxe-icon-refresh" @click="xGridDom?.commitProxy('query')">
          {{ textMap.refresh }}
        </vxe-button>
      </template>
      <template #status-column="{ row }">
        <el-tag :type="getStatusTagType(row.status)" effect="plain">
          {{ row.status || "-" }}
        </el-tag>
      </template>
      <template #prompt-column="{ row }">
        <div class="prompt-cell">
          <span class="prompt-text">{{ getPromptPreview(row.prompt) }}</span>
          <el-button v-if="row.prompt" link type="primary" @click="openPromptDialog(row)">
            查看详情
          </el-button>
        </div>
      </template>
      <template #cos-url-column="{ row }">
        <el-image
          v-if="row.cos_url"
          :src="row.cos_url"
          :preview-src-list="[row.cos_url]"
          fit="cover"
          preview-teleported
          class="cos-thumb"
        />
        <span v-else>-</span>
      </template>
      <template #row-operate="{ row }">
        <el-button
          link
          :type="isInGallery(row) ? 'warning' : 'success'"
          :loading="setGalleryLoadingId === row.id"
          :disabled="!canToggleGallery(row) || setGalleryLoadingId === row.id"
          @click="toggleGallery(row)"
        >
          {{ getGalleryActionLabel(row) }}
        </el-button>
      </template>
    </vxe-grid>

    <el-dialog v-model="promptDialog.visible" :title="textMap.promptDetail" width="680px" append-to-body>
      <div class="prompt-detail">{{ promptDialog.content }}</div>
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
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prompt-detail {
  white-space: pre-wrap;
  line-height: 1.6;
  word-break: break-word;
}

.url-link {
  color: var(--el-color-primary);
}

.cos-thumb {
  width: 56px;
  height: 56px;
  border-radius: 6px;
}
</style>
