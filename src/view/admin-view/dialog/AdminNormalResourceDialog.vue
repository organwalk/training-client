<script setup>
import {ref, defineProps, defineEmits, watchEffect, reactive, onBeforeMount} from "vue";
import {getDeptList} from "@/api/dept-api";
import {
  fileSliceSize,
  getNormalResourceDetail,
  getResourceTagByDeptId,
  updateNormalResourceDetail,
  uploadNormalResource
} from "@/api/resource-api";
import { UploadFilled } from '@element-plus/icons-vue'
import TcButtonConform from "@/components/button/tc-button-conform.vue";
import {ElMessage} from "element-plus";
import {calculateHash} from "@/utils/dataUtil";

const props = defineProps({
  showNormalResourceDialog:Boolean,
  title:String,
  rid:Number
})
const emit = defineEmits(['closeNormalResource'])
const buttonTextList = [{'title':'上传普通资源','button':'上传资源'}, {'title':'编辑资源详细','button':'确认编辑'}]
const buttonText = ref('上传资源')
watchEffect(() => {
  buttonText.value = buttonTextList.find(item => item.title === props.title).button
})
// 控制对话框显隐
const showNormalResourceDialog = ref()
const closeNormalResource = (des) => {
  showNormalResourceDialog.value = false
  emit('closeNormalResource', {
    state:false,
    des:des + '-' + Math.random()
  })
}
watchEffect(() => {
  showNormalResourceDialog.value = props.showNormalResourceDialog
})


// 封装表单数据
const normalResourceInfo = reactive({
  resource_name:'',
  dept_id:'',
  tag_id:'',
  up_id:Number(sessionStorage.getItem('uid'))
})
const deptList = ref()
const getDeptListAndTagListFromApi = async () => {
  loading.value = true
  const res = await getDeptList('1000', 0)
  if (res.code === 2002){
    deptList.value = res.data.map(({id, deptName}) => ({value: id, label: deptName}))
    if (!props.rid){
      normalResourceInfo.dept_id = deptList.value[0].value
      await getTagListFromApi(normalResourceInfo.dept_id)
    }
  }else {
    closeNormalResource(null)
  }
}
const tagList = ref()
const tagState = ref(false)
const getTagListFromApi = async (deptId) => {
  loading.value = true
  const res = await getResourceTagByDeptId(deptId)
  if (res.code === 2002){
    tagState.value = false
    tagList.value = res.data.map(({id, tagName}) => ({value: id, label: tagName}))
    if (!props.rid){
      normalResourceInfo.tag_id = tagList.value[0].value
    }
  }else {
    normalResourceInfo.tag_id = ''
    tagState.value = true
  }
  loading.value = false
}
const getNormalResourceDetailFromApi = async () => {
  loading.value = true
  const res = await getNormalResourceDetail(props.rid)
  if (res.code === 2002){
    normalResourceInfo.dept_id = res.data.dept_id
    await getTagListFromApi(normalResourceInfo.dept_id)
    normalResourceInfo.tag_id = res.data.tag_id
    normalResourceInfo.resource_name = res.data.resource_name
    normalResourceInfo.up_id = res.data.up_id
  }else {
    closeNormalResource(null)
  }
  loading.value = false
}
// 上传文件
const resourceFile = ref()
const handChange = (file, fileList) => {
  resourceFile.value = file
  if (fileList.length > 1) {
    fileList.splice(0, 1);
  }
}
const handRemove = () => {
  resourceFile.value = null
}
const uploadState = (obj, file) => {
  if (file){
    return Object.keys(obj).some(key => !obj[key])
  }else {
    return !props.rid;
  }
}

const getFileTotalSlice = () => { return Math.ceil(resourceFile.value.size / fileSliceSize) }
const uploadProgress = ref(0)
const uploadColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#1989fa', percentage: 60 },
  { color: '#6f7ad3', percentage: 80 },
  { color: '#5cb87a', percentage: 100 },
]
const uploadFileState = ref(false)
const upload = async () => {
  uploadFileState.value = true
  if (props.rid){
    let file = null
    if (resourceFile.value){
      file = resourceFile.value.raw
    }
    const res = await updateNormalResourceDetail(props.rid, normalResourceInfo, file)
    if (res.code === 2002){
      ElMessage.success(res.msg)
      closeNormalResource('edit')
    }
  }else {
    for (let i = 1; i <= getFileTotalSlice(); i++) {
      let chunk;
      if (i === getFileTotalSlice()) {
        // 最后一片
        chunk = resourceFile.value.raw.slice((i - 1) * fileSliceSize, resourceFile.value.size);//切割文件
      } else {
        chunk = resourceFile.value.raw.slice((i - 1) * fileSliceSize, i * fileSliceSize);
      }
      const hashValue = await calculateHash(resourceFile.value.raw)
      let fileObj = {
        resource_file: chunk,
        file_hash: hashValue,
        file_size: resourceFile.value.size,
        file_chunks_sum: getFileTotalSlice(),
        file_now_chunk: i,
        file_origin_name: resourceFile.value.raw.name
      }
      if (i === 1){
        await uploadNormalFile(i, fileObj)
      }else {
        setTimeout(async () => {
          await uploadNormalFile(i, fileObj)
        }, 3000)
      }
    }
  }
  loading.value = false
}

const uploadNormalFile = async (i, fileObj) => {
  const res = await uploadNormalResource(normalResourceInfo, fileObj)
  if (res.msg === "当前文件片段上传成功"){
    uploadProgress.value = Math.floor((i / getFileTotalSlice()) * 100);
  }else if (res.msg === "资源文件上传成功"){
    ElMessage.success(res.msg)
    uploadFileState.value = false
    closeNormalResource('add')
  }
}


const loading = ref(false)

onBeforeMount(() => {
  getDeptListAndTagListFromApi()
  if (props.title === '编辑资源详细'){
    getNormalResourceDetailFromApi()
  }
})
</script>

<template>
<el-dialog v-model="showNormalResourceDialog"
           :title="props.title"
           width="50%"
           style="margin-top: 20px"
           destroy-on-close
           :show-close="false"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :before-close="closeNormalResource">
  <el-form :model="normalResourceInfo" label-width="100px" v-loading="loading">
    <el-form-item label="填入资源名称">
      <el-input v-model="normalResourceInfo.resource_name"
                :disabled="uploadFileState"
                placeholder="请输入上传资源名称，如：市场营销入门级手册" />
    </el-form-item>
    <el-form-item label="选择上传部门">
      <el-select v-model="normalResourceInfo.dept_id"
                 placeholder="需要选择一个有效部门"
                 @change="getTagListFromApi"
                 :disabled="uploadFileState"
                 filterable>
        <el-option
            v-for="item in deptList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="选择分类标签">
      <el-select v-model="normalResourceInfo.tag_id"
                 placeholder="需要选择一个资源分类标签"
                 :disabled="tagState || uploadFileState"
                 filterable>
        <el-option
            v-for="item in tagList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="上传资源文件">
      <el-upload
          drag
          limit="2"
          :auto-upload="false"
          :on-change="handChange"
          :on-remove="handRemove"
          :disabled="uploadFileState"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖动文件至此处 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            only supports uploading one file at a time
          </div>
        </template>
      </el-upload>
    </el-form-item>
    <el-form-item label="文件上传进度" v-show="uploadFileState">
      <el-progress style="width: 100%;height: auto" :percentage="uploadProgress" :color="uploadColors"/>
    </el-form-item>

  </el-form>
  <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeNormalResource" :disabled="loading || uploadFileState">取消</el-button>
        <tc-button-conform @click="upload"
                           :disabled="uploadState(normalResourceInfo, resourceFile) || loading">{{ buttonText }}</tc-button-conform>
      </span>
  </template>
</el-dialog>
</template>

<style scoped>

</style>