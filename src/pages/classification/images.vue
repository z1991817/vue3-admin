<script setup>
import { getToken } from "@@/utils/local-storage"
import { Delete, Plus } from "@element-plus/icons-vue"
import { getClassificationApi } from "@/common/apis/classification"
import { createImageApi, deleteImageApi, getImageApi, updateImageApi } from "@/common/apis/images"

// 分类列表
const categories = ref([])
const activeCategory = ref(undefined)

// 加载分类列表
async function loadCategories() {
  try {
    const res = await getClassificationApi({ currentPage: 1, size: 100 })
    if (res?.data?.list) {
      categories.value = res.data.list
      if (categories.value.length > 0) {
        activeCategory.value = categories.value[0].id
      }
    }
  } catch (error) {
    console.error("加载分类失败", error)
  }
}

// 页面加载时获取分类
onMounted(() => {
  loadCategories()
})

// 监听分类切换，重新加载数据
watch(activeCategory, () => {
  if (activeCategory.value !== undefined) {
    crudStore.commitQuery()
  }
})

const xGridDom = useTemplateRef("xGridDom")
const xGridOpt = reactive({
  loading: true,
  autoResize: true,
  rowConfig: {
    height: 100
  },
  /** 分页配置项 */
  pagerConfig: {
    align: "right"
  },
  /** 表单配置项 */
  formConfig: {
    items: [
      {
        field: "title",
        itemRender: {
          name: "VxeInput",
          props: {
            placeholder: "图片标题",
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
    checkMethod: ({ column }) => !["title"].includes(column.field)
  },
  /** 列配置 */
  columns: [
    {
      type: "checkbox",
      width: "50px"
    },
    {
      field: "title",
      title: "标题",
      width: "200px"
    },
    {
      field: "url",
      title: "图片",
      width: "150px",
      slots: {
        default: "image-column"
      }
    },
    {
      field: "description",
      title: "描述"
    },
    {
      field: "created_at",
      title: "创建时间",
      width: "180px"
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
    autoLoad: false,
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
            category_id: activeCategory.value,
            title: form.title || "",
            size: page.pageSize,
            currentPage: page.currentPage
          }
          // 调用接口
          getImageApi(params).then(callback).catch(callback)
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
    // 重置上传文件列表
    uploadFileList.value = []
    uploadLoading.value = false

    if (row) {
      crudStore.isUpdate = true
      xModalOpt.title = "修改图片"
      // 赋值
      xFormOpt.data.id = row.id
      xFormOpt.data.category_id = row.category_id
      xFormOpt.data.title = row.title
      xFormOpt.data.url = row.url
      xFormOpt.data.description = row.description
      xFormOpt.data.prompt = row.prompt || ""
    } else {
      crudStore.isUpdate = false
      xModalOpt.title = "新增图片"
      // 清空表单数据
      xFormOpt.data.id = undefined
      xFormOpt.data.category_id = activeCategory.value
      xFormOpt.data.title = ""
      xFormOpt.data.url = ""
      xFormOpt.data.description = ""
      xFormOpt.data.prompt = ""
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
        updateImageApi(xFormOpt.data).then(callback).catch(() => {
          xFormOpt.loading = false
        })
      } else {
        // 调用新增接口
        createImageApi(xFormOpt.data).then(callback).catch(() => {
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
    const tip = `确定 <strong style="color: var(--el-color-danger);"> 删除 </strong> 图片 <strong style="color: var(--el-color-primary);"> ${row.title} </strong> ？`
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
      deleteImageApi(row.id).then(() => {
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

// 文件上传相关
const uploadFileList = ref([])
const uploadLoading = ref(false)
const uploadAction = `${import.meta.env.VITE_BASE_URL}/admin/images/upload`

// 文件上传前的验证
function beforeUpload(file) {
  const isImage = file.type.startsWith("image/")
  const isLt20M = file.size / 1024 / 1024 < 20

  if (!isImage) {
    ElMessage.error("只能上传图片格式文件!")
    return false
  }
  if (!isLt20M) {
    ElMessage.error("上传图片大小不能超过 20MB!")
    return false
  }
  return true
}

// 文件上传成功
function handleUploadSuccess(response) {
  uploadLoading.value = false
  if (response?.data?.url) {
    xFormOpt.data.url = response.data.url
    ElMessage.success("上传成功")
  }
}

// 文件上传失败
function handleUploadError() {
  uploadLoading.value = false
  ElMessage.error("上传失败")
}

// 文件改变
function handleUploadChange(file, fileList) {
  uploadFileList.value = fileList
  if (file.status === "uploading") {
    uploadLoading.value = true
  }
}

// 移除文件
function handleRemove() {
  xFormOpt.data.url = ""
  uploadFileList.value = []
}

const xFormOpt = reactive({
  span: 24,
  titleWidth: "100px",
  loading: false,
  /** 是否显示标题冒号 */
  titleColon: false,
  data: {
    id: undefined,
    category_id: undefined,
    title: "",
    url: "",
    description: "",
    prompt: ""
  },
  rules: {
    category_id: [
      {
        required: true,
        validator: ({ itemValue }) => {
          if (!itemValue) {
            return new Error("请选择分类")
          }
        }
      }
    ],
    title: [
      {
        required: true,
        validator: ({ itemValue }) => {
          switch (true) {
            case !itemValue:
              return new Error("请输入标题")
            case !itemValue.trim():
              return new Error("空格无效")
          }
        }
      }
    ],
    url: [
      {
        required: true,
        validator: ({ itemValue }) => {
          if (!itemValue) {
            return new Error("请上传图片")
          }
        }
      }
    ]
  },
  items: [
    {
      field: "category_id",
      title: "分类",
      itemRender: {
        name: "$select",
        options: computed(() => categories.value.map(cat => ({ label: cat.name, value: cat.id }))),
        props: {
          placeholder: "请选择分类"
        }
      }
    },
    {
      field: "title",
      title: "标题",
      itemRender: {
        name: "$input",
        props: {
          placeholder: "请输入标题"
        }
      }
    },
    {
      field: "url",
      title: "图片",
      slots: {
        default: "upload-slot"
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
      field: "prompt",
      title: "prompt",
      itemRender: {
        name: "$textarea",
        props: {
          placeholder: "请输入prompt",
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
</script>

<template>
  <div class="app-container">
    <!-- 分类标签页 -->
    <el-tabs v-model="activeCategory" class="category-tabs">
      <el-tab-pane
        v-for="category in categories"
        :key="category.id"
        :label="category.name"
        :name="category.id"
      />
    </el-tabs>

    <!-- 表格 -->
    <vxe-grid ref="xGridDom" v-bind="xGridOpt">
      <!-- 工具栏按钮 -->
      <template #toolbar-btns>
        <vxe-button status="primary" icon="vxe-icon-add" @click="crudStore.onShowModal()">
          新增图片
        </vxe-button>
      </template>
      <!-- 图片列 -->
      <template #image-column="{ row }">
        <el-image
          :src="row.url"
          :preview-src-list="[row.url]"
          fit="cover"
          style="width: 80px; height: 80px; border-radius: 4px;"
          preview-teleported
        />
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
      <vxe-form ref="xFormDom" v-bind="xFormOpt">
        <!-- 文件上传插槽 -->
        <template #upload-slot>
          <div v-if="xFormOpt.data.url" style="position: relative; display: inline-block;">
            <el-image
              :src="xFormOpt.data.url"
              fit="cover"
              style="width: 148px; height: 148px; border-radius: 4px;"
            />
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              circle
              style="position: absolute; top: -8px; right: -8px;"
              @click="handleRemove"
            />
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
                支持 jpg/png/gif 格式，文件大小不超过 20MB
              </div>
            </template>
          </el-upload>
        </template>
      </vxe-form>
    </vxe-modal>
  </div>
</template>

<style lang="sass" scoped>
.category-tabs
  margin-bottom: 20px
</style>
