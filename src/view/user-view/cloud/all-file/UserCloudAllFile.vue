<script setup>
import {Search, UploadFilled} from "@element-plus/icons-vue";
import {onBeforeMount, ref, defineEmits, watchEffect} from "vue";
import TcPagination from "@/components/container/tc-pagination.vue";
import {withLoading} from "@/utils/functionUtil";
import {getDeptList} from "@/api/dept-api";
import {
  downloadResource,
  fileSliceSize,
  getNormalResourceByDeptIdAndTagId,
  getResourceTagByDeptId, selectNormalResourceByKeyword,
  uploadNormalResource
} from "@/api/resource-api";
import {ElMessage} from "element-plus";
import {calculateHash} from "@/utils/dataUtil";

const emit = defineEmits(['loading'])
const loading = ref(false)
watchEffect(() => {
  emit('loading', loading.value)
})

const localFile = ref()
const handChange = (file, fileList) => {
  localFile.value = file
  if (fileList.length > 1) {
    fileList.splice(0, 1);
  }
}

// 文件移除时
const handRemove = () => {
  localFile.value = ''
}


// 部门选择器
const deptId = ref()
const deptList = ref()
const loadingDept = withLoading(async() => {
  const res = await getDeptList('999999', 0)
  if (res.code === 2002) {
    deptList.value = res.data.map(({id, deptName}) => ({value: id, label: deptName}))
    deptId.value = Number(sessionStorage.getItem("dept_id"))
    await loadingTagList(deptId.value)
  }
}, loading)
const changeDept = async (val) => {
  if (val){
    await loadingTagList(val)
  }else {
    tagId.value = ''
  }
}


// 分类标签选择器
const tagId = ref()
const uploadTagId = ref()
const tagList = ref([])
const uploadTagList = ref([])
const loadingTagList = async (nowDept) => {
  const res = await getResourceTagByDeptId(nowDept)
  if (res.code === 2002){
    tagList.value = res.data.map(({id, tagName}) => ({value: id, label: tagName}))
    if (tagList.value.length !== 0){
      tagId.value = tagList.value[0].value
      await loadingDeptAndTagResource(tagId.value, 0)
    }
  }
}


// 上传资源文件
const uploadProgress = ref(0)
const uploadFileState = ref(false)
const resourceName = ref('')
const getFileTotalSlice = () => { return Math.ceil(localFile.value.size / fileSliceSize) }
const upload = async () => {
  if (!uploadTagId.value){
    ElMessage.warning('需要选择上传分类')
  }else if (!resourceName.value){
    ElMessage.warning('资源名称不能为空')
  }else if (!localFile.value){
    ElMessage.warning('文件不能为空')
  }else {
    uploadFileState.value = true
    for (let i = 1; i <= getFileTotalSlice(); i++) {
      let chunk;
      if (i === getFileTotalSlice()) {
        // 最后一片
        chunk = localFile.value.raw.slice((i - 1) * fileSliceSize, localFile.value.size);//切割文件
      } else {
        chunk = localFile.value.raw.slice((i - 1) * fileSliceSize, i * fileSliceSize);
      }
      const hashValue = await calculateHash(localFile.value.raw)
      let fileObj = {
        resource_file: chunk,
        file_hash: hashValue,
        file_size: localFile.value.size,
        file_chunks_sum: getFileTotalSlice(),
        file_now_chunk: i,
        file_origin_name: localFile.value.raw.name
      }
      const msg = await uploadNormalFile(i, fileObj)
      if (msg === "资源文件上传成功"){
        ElMessage.success(msg)
        resourceName.value = ""
        uploadFileState.value = false
        uploadProgress.value = 0
        if (tagId.value === uploadTagId.value){
          await loadingDeptAndTagResource(tagId.value, 0)
        }
        break
      }
    }
  }
}
const uploadNormalFile = async (i, fileObj) => {
  const normalResourceInfo = {
    resource_name:resourceName.value,
    dept_id:Number(sessionStorage.getItem('dept_id')),
    tag_id:Number(uploadTagId.value),
    up_id:Number(sessionStorage.getItem('uid'))
  }
  const res = await uploadNormalResource(normalResourceInfo, fileObj)
  if (res.msg === "当前文件片段上传成功"){
    uploadProgress.value = Math.floor((i / getFileTotalSlice()) * 100);
  }
  return res.msg
}


// 加载资源列表
const resourceList = ref([])
const resourceTotal = ref(0)
const tableLoading = ref(false)
const loadingDeptAndTagResource = async (nowTag, offset) => {
  tableLoading.value = true
  const res = await getNormalResourceByDeptIdAndTagId(deptId.value, nowTag, offset)
  if (res.code === 2002){
    resourceTotal.value = res.total
    resourceList.value = res.data
  }else {
    tagId.value = ''
  }
  tableLoading.value = false
}

const changeTag = async (val) => {
  if (val){
    await loadingDeptAndTagResource(val, 0)
  }
}


// 模糊搜索资源
const searchKeyword = ref('')
const timer = ref(null)
const search = async (val) => {
  searchKeyword.value = val
  clearTimeout(timer.value)
  timer.value = setTimeout(async () => {
    if (val){
      await loadingSearchResult(val, 0)
    }else {
      await loadingDeptAndTagResource(tagId.value, 0)
    }
  }, 1000)
}

const loadingSearchResult = async (keyword, offset) => {
  tableLoading.value = true
  const res = await selectNormalResourceByKeyword(keyword,offset,deptId.value,tagId.value)
  if (res.code === 2002){
    resourceTotal.value = res.total
    resourceList.value = res.data
  }
  tableLoading.value = false
}


// 下载指定资源文件
const downLoading = async (rid) => {
  await downloadResource(rid)
}


// 换页
const pageChange = async (val) => {
  const offset = (val-1) * 10
  if (searchKeyword.value){
    await loadingSearchResult(searchKeyword.value, offset)
  }else {
    await loadingDeptAndTagResource(tagId.value, offset)
  }
}

onBeforeMount(async () =>{
  await loadingDept()
  uploadTagList.value = tagList.value
  uploadTagId.value = tagId.value
})

const authTagMap = {
  '1':'',
  '2':'waring',
  '3':'danger'
}
const authMap = {
  '1':'员工',
  '2':'教师',
  '3':'管理员'
}


</script>

<template>
  <el-card shadow="never"
           style="border-radius: 0; height: 90vh;border-top: none;border-left: none;border-bottom: none;overflow-y: auto">
    <el-row :gutter="15">
      <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
        <el-card style="border-radius: 10px;user-select: none;height: 40vh;background-color: #409EFF;color: white">
          <h3 style="margin-top: 0;margin-bottom: 0">云集&nbsp;Cloud Storage</h3><br/>
          <el-text style="color: #f1f2f3">云集是企业内的云存储服务，其目的是汇集企业内成员分享的各类知识库文档或其他相关资料。请您在上传文件时确保文件内容与部门及分类相同，若部门不存在分类标签，请联系管理员</el-text>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
        <el-card style="border-radius: 10px;user-select: none;height: 40vh;">
          <template #header>
            <div class="card-header">
              <el-row style="display: flex;align-items: center">
                <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18">
                  <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;上传至云集</h3>
                </el-col>
                <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right;">
                  <el-button type="primary" round color="#333333" @click="upload" v-btn :loading="uploadFileState">
                    确认上传
                  </el-button>
                </el-col>
              </el-row>
            </div>
          </template>
          <el-row :gutter="15" v-if="!uploadFileState">
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
              <el-form label-position="top">
                <el-form-item label="上传分类">
                  <el-select v-model="uploadTagId"
                             placeholder="选择分类标签"
                             style="width: 100%"
                             :disabled="uploadFileState"
                             filterable>
                    <el-option
                        v-for="item in tagList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="资源名称">
                  <el-input v-model="resourceName" placeholder="请输入资源名称"/>
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
              <el-upload
                  drag
                  :limit="2"
                  :auto-upload="false"
                  :on-change="handChange"
                  :on-remove="handRemove"
              >
                <el-icon class="el-icon--upload">
                  <upload-filled/>
                </el-icon>
                <div class="el-upload__text" >
                  拖动文件至此处 <em>点击上传</em>
                </div>
              </el-upload>
            </el-col>
          </el-row>
          <el-card shadow="never" style="border: none" align="center" v-if="uploadFileState">
            <el-progress type="circle" :percentage="uploadProgress" ></el-progress>
          </el-card>
        </el-card>
      </el-col>
    </el-row><br/>
    <el-row>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-card style="border-radius: 10px;user-select: none;height: 80vh">
          <el-row :gutter="10">
            <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
              <el-select
                  v-model="deptId"
                  @change="changeDept"
                  placeholder="选择指定部门" filterable>
                <el-option
                    v-for="item in deptList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
            </el-col>
            <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
              <el-select v-model="tagId"
                         @change="changeTag"
                         placeholder="选择分类标签"
                         :disabled="!deptId || tagList.length === 0"
                         filterable>
                <el-option
                    v-for="item in tagList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
            </el-col>
            <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
              <el-input v-model="searchKeyword" placeholder="搜索资源名称" :prefix-icon="Search" @input="search" clearable/>
            </el-col>
            <el-col :xs="10" :sm="10" :md="10" :lg="10" :xl="10">
              <tc-pagination :total="resourceTotal" @page-current-change="pageChange"/>
            </el-col>
          </el-row>
          <el-table
              stripe
              style="margin-top: 15px;overflow-y: auto;border-radius: 5px"
              border :data="resourceList" v-loading="tableLoading">
            <el-table-column type="index"/>
            <el-table-column prop="resource_name" label="资源名称" min-width="125px" show-overflow-tooltip/>
            <el-table-column label="身份权限">
              <template #default="scope">
                <el-tag :type="authTagMap[scope.row['upInfo']['auth_id']]">{{ authMap[scope.row['upInfo']['auth_id']] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="upInfo.realName" label="上传者"/>
            <el-table-column prop="up_datetime" label="上传时间" min-width="125px" show-overflow-tooltip/>
            <el-table-column label="操作" >
              <template #default="scope">
                <el-button size="small" round type="primary" @click="downLoading(scope.row['id'])">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<!--suppress CssUnusedSymbol -->
<style scoped>
.el-pagination {
  justify-content: center;
}
/deep/ .el-upload-dragger{
  padding-top: 20px;
  padding-bottom: 20px;
}
</style>