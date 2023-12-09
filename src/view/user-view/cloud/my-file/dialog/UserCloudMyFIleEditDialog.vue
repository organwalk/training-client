<script setup>
import {Close} from "@element-plus/icons-vue";
import {ref, defineProps, defineEmits, watchEffect} from "vue";
import {withLoading} from "@/utils/functionUtil";
import {
  fileSliceSize,
  getNormalResourceDetail,
  getResourceTagByDeptId,
  updateNormalResourceDetail
} from "@/api/resource-api";
import {ElMessage} from "element-plus";
import {calculateHash} from "@/utils/dataUtil";

const props = defineProps({
  dialog: Boolean,
  rid: Number
})
const emit = defineEmits(['close'])
const dialog = ref(false)
const loading = ref(false)
watchEffect(() => {
  dialog.value = props.dialog
})

// 获取资源详细
const resourceName = ref('')
const deptId = ref()
const tagId = ref()
const userId = ref()
const loadingDetail = withLoading(async (rid) => {
  const res = await getNormalResourceDetail(rid)
  if (res.code === 2002) {
    resourceName.value = res.data['resource_name']
    deptId.value = res.data['dept_id']
    tagId.value = res.data['tag_id']
    userId.value = res.data['up_id']
    await loadingTagList()
  } else {
    closeDialog('cancel')
  }
}, loading)


// 分类标签选择器
const tagList = ref([])
const loadingTagList = async () => {
  const res = await getResourceTagByDeptId(sessionStorage.getItem("dept_id"))
  if (res.code === 2002) {
    tagList.value = res.data.map(({id, tagName}) => ({value: id, label: tagName}))
  }
}


// 文件选择器
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


// 上传资源文件
const uploadState = ref(false)
const uploadProgress = ref(0)
const getFileTotalSlice = () => { return Math.ceil(localFile.value.size / fileSliceSize) }
const submit = async () => {
  if (!tagId.value){
    ElMessage.warning('需要选择上传分类')
  }else if (!resourceName.value){
    ElMessage.warning('资源名称不能为空')
  }else if (!localFile.value){
    ElMessage.warning('文件不能为空')
  }else {
    uploadState.value = true
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
        uploadState.value = false
        uploadProgress.value = 0
        location.reload()
        break
      }
    }
  }
}
const uploadNormalFile = async (i, fileObj) => {
  const normalResourceInfo = {
    resource_name:resourceName.value,
    dept_id:Number(deptId.value),
    tag_id:Number(tagId.value),
    up_id:Number(userId.value)
  }
  const res = await updateNormalResourceDetail(props.rid, normalResourceInfo, fileObj)
  if (res.msg === "当前文件片段上传成功"){
    uploadProgress.value = Math.floor((i / getFileTotalSlice()) * 100);
  }
  return res.msg
}


watchEffect(async () => {
  if (props.rid) {
    await loadingDetail(props.rid)
  }
})


// 关闭对话框时
const closeDialog = (des) => {
  dialog.value = false
  emit('close', des + '-' + Math.random())
}
</script>

<template>
  <el-dialog v-model="dialog"
             v-if="dialog"
             width="45%"
             style="border-radius: 15px"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             :lock-scroll="false"
  >
    <template #header>
      <div class="card-header">
        <el-row style="display: flex; align-items: center;">
          <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1">
            <el-button style="border: none"
                       :icon="Close" :disabled="uploadState"
                       @click="closeDialog('cancel')"
                       circle/>
          </el-col>
          <el-col :xs="17" :sm="17" :md="17" :lg="17" :xl="17">
            <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;重新上传资源文件</h3>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right;">
            <el-button color="#333333" type="primary"
                       :loading="uploadState"
                       @click="submit"
                       round>
              确认编辑
            </el-button>
          </el-col>
        </el-row>
      </div>
    </template>
    <el-card style="border-radius: 10px;margin-top: -10px;"
             shadow="never"
             v-loading="loading">
      <el-form label-position="top">
        <el-form-item label="上传分类">
          <el-select style="width: 100%"
                     placeholder="选择分类标签"
                     v-model="tagId" :disabled="uploadState"
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
          <el-input minlength="1" maxlength="20"
                    v-model="resourceName" :disabled="uploadState"
                    show-word-limit/>
        </el-form-item>
        <el-form-item label="上传资源">
          <el-upload
              :limit="2" :auto-upload="false"
              :on-change="handChange" :on-remove="handRemove"
              :disabled="uploadState"
          >
            <el-button type="primary" :loading="uploadState">选择文件</el-button>
          </el-upload>
        </el-form-item><br/>
        <el-progress :percentage="uploadProgress" v-if="uploadState"></el-progress>
      </el-form>


    </el-card>
  </el-dialog>
</template>

<style scoped>

</style>