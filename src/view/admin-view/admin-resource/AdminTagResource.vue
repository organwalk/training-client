<script setup>
import {computed, defineProps, onBeforeMount, ref, watch, watchEffect} from 'vue'
import {deleteTag, editTag, getResourceTagList} from "@/api/resource-api";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {ElMessage} from "element-plus";
import TcButtonConform from "@/components/button/tc-button-conform.vue";

const props = defineProps({
  deptId: Number,
  dialogDes: String,
  keyword:String,
  tagDeptId:Number
})
const loading = ref(false)
const empty = ref(false)
const showEdit = ref(false)

// 初始化数据
const deptId = ref()
const dialogDes = ref()
const keyword = computed(() => props.keyword)
const tagDeptId = computed(() => props.tagDeptId)
watchEffect(async () => {
  deptId.value = props.deptId
  dialogDes.value = props.dialogDes
})
watch(deptId, async (newVal, oldVal) => {
  newVal !== oldVal && await loadingDataList()
})
watch(dialogDes, async (newVal, oldVal) => {
  if(newVal !== oldVal && tagDeptId.value === originalDeptId.value){
    console.log(dialogDes)
    console.log(tagDeptId)
    console.log(originalDeptId.value)
    console.log(deptId.value)
    deptId.value = originalDeptId.value
    await loadingDataList()
  }
})
watch(keyword, (newVal, oldVal) => {
  if (newVal !== oldVal){
    dataList.value = originalList.value.filter(item => item.tagName.includes(newVal))
  }
})

// 初始化标签列表
const dataList = ref()
const originalList = ref()
const originalDeptId = ref()
const loadingDataList = async () => {
  if (deptId.value) {
    loading.value = true
    const res = await getResourceTagList(deptId.value)
    if (res.code === 2002) {
      empty.value = false
      originalDeptId.value = deptId.value
      dataList.value = res.data
      originalList.value = res.data
    } else {
      dataList.value = []
      originalList.value = []
      empty.value = true
    }
    loading.value = false
  }
}
const newTagName = ref()
const tagId = ref()
const loadingDialog = ref(false)
const edit = async () => {
  loadingDialog.value = true
  const res = await editTag(tagId.value, newTagName.value)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    dataList.value.find(item => item.id === tagId.value).tagName = newTagName.value
    originalList.value = dataList.value
    showEdit.value = false
    newTagName.value = ''
  }
  loadingDialog.value = false
}
const delTag = async (tagId) => {
  loading.value = true
  const res = await deleteTag(tagId)
  if (res.code === 2002){
    ElMessage.success({
      message:res.msg,
      grouping:true,
      type:'success'
    })
    dataList.value.splice(dataList.value.findIndex(item => item.id === tagId), 1)
    originalList.value = dataList.value
  }
  loading.value = false
}
onBeforeMount(async () => {
  await loadingDataList()
})
</script>

<template>
  <div v-loading="loading" style="height: 80vh;overflow-y: auto">
    <el-row :gutter="10">
      <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" v-for="(item, index) in dataList" :key="index">
        <el-card :shadow="'hover'">
          <tc-container-full-row>
            <el-col :xs="20" :sm="20" :md="20" :lg="24" :xl="20">
              <span>{{ item.tagName }}</span>
            </el-col>
          </tc-container-full-row>
          <br/>
          <el-row>
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="right">
              <el-button size="small" type="primary"
                         @click="() => {tagId = item.id; showEdit = true}" v-btn>编辑</el-button>
              <el-button size="small" type="danger" @click="delTag(item.id)">删除</el-button>
            </el-col>
          </el-row>
        </el-card>
        <br/>
      </el-col>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="center">
        <el-empty v-if="empty"/>
      </el-col>
    </el-row>
  </div>
  <el-dialog v-model="showEdit"
             v-if="showEdit"
             title="编辑标签"
             width="30%"
             destroy-on-close
             :show-close="false"
             :close-on-click-modal="false"
             :close-on-press-escape="false">
    <el-input v-model="newTagName"
              v-loading="loadingDialog"
              placeholder="输入标签名称"
              maxlength="10" show-word-limit/>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showEdit = false" :disabled="loadingDialog">取消</el-button>
        <tc-button-conform @click="edit"
                           :disabled="loadingDialog || !newTagName">提交</tc-button-conform>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>