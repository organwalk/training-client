<script setup>
import {onBeforeMount, ref, watchEffect, defineEmits, defineProps, watch} from "vue";
import TcPagination from "@/components/container/tc-pagination.vue";
import {
  deleteNormalResource,
  downloadResource,
  getNormalResource,
  getNormalResourceByDeptIdAndTagId, selectNormalResourceByKeyword,
} from "@/api/resource-api";
import {ElMessage} from "element-plus";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";

// 定义全局变量
const loading = ref(false)
const emit = defineEmits(['edit'])
const props = defineProps({
  selectVal:Array,
  searchKeyword:String,
  searchResultOffset:Number,
  dialogDes:String
})
const selectVal = ref() //  部门-分类标签数组
const searchKeyword = ref() //  搜索关键词
const searchResultOffset = ref()  //  搜索结果偏移量
const dialogDes = ref() // 对话框描述

watchEffect(async () => {
  // 响应式父组件通信值
  selectVal.value = props.selectVal
  searchKeyword.value = props.searchKeyword
  searchResultOffset.value = props.searchResultOffset
  dialogDes.value = props.dialogDes
})
watchEffect(async () => {
  // 当搜索关键词存在时，触发加载搜索结果
  if (searchKeyword.value){
    await selectNormalResourceByKeywordFromApi(searchKeyword.value, searchResultOffset.value)
  }
})
watch(searchKeyword, async (newVal, oldValue)=>{
  if (oldValue && newVal === ''){
    await loadingDataList(0)
  }
})
watchEffect(async () => {
  // 当对话框描述存在时，触发加载结果
  if (dialogDes.value){
    if (dialogDes.value.split('-')[0] === 'edit'){
      await loadingDataList(nowOffset.value)
    }else if (dialogDes.value.split('-')[0] === 'add'){
      await loadingDataList(0)
    }
  }
})

// 加载表格数据
const loadingDataList = async (offset) => {
  if (selectVal.value !== undefined && selectVal.value !== null){
    await getNormalResourceList(offset)
  }else {
    await getAllNormalResourceList(offset)
  }
}

const selectNormalResourceByKeywordFromApi = async (val, offset) => {
  loading.value = true
  if (val){
    const res = await selectNormalResourceByKeyword(val, offset, deptId.value, tagId.value)
    if (res.code === 2002){
      dataList.value = res.data
      total.value = res.total
    }
  }else {
    await loadingDataList(offset)
  }
  loading.value = false
}

// 表格相关
const dataList = ref([])
const total = ref()
const getAllNormalResourceList = async (offset) => {
  loading.value = true
  const res = await getNormalResource(offset)
  if (res.code === 2002){
    total.value = res.total
    dataList.value = res.data
  }else {
    dataList.value = []
  }
  loading.value = false
}
const deptId = ref()
const tagId = ref()
const getNormalResourceList = async (offset)=> {
  deptId.value = selectVal.value[0]
  tagId.value = selectVal.value[1]
  loading.value = true
  const res = await getNormalResourceByDeptIdAndTagId(deptId.value, tagId.value, offset)
  if (res.code === 2002){
    total.value = res.total
    dataList.value = res.data
  }else {
    dataList.value = []
  }
  loading.value = false
}
watchEffect(async ()=>{
  await loadingDataList(0)
})
const rId = ref()

// 获取新的页数
const nowOffset = ref(1)
const getNewPageNumber = async (val) => {
  const offset = (val-1) * 10
  nowOffset.value = offset
  if (searchKeyword.value){
    await selectNormalResourceByKeywordFromApi(searchKeyword.value, offset)
  }else {
    await loadingDataList(offset)
  }
}

// 编辑资源
const showNormalResourceDialog = ref(false)
const title = ref('上传普通资源')
const editNormalResource = (rid) => {
  showNormalResourceDialog.value = true
  rId.value = rid
  title.value = '编辑资源详细'
  emit('edit', {
    showEdit:showNormalResourceDialog.value,
    title:title.value,
    rid:rId.value
  })
}
// 删除指定资源
const deleteNormalResourceFromApi = async (rid) => {
  loading.value = true
  const res = await deleteNormalResource(rid, sessionStorage.getItem("uid"))
  if (res.code === 2002){
    dataList.value.splice(dataList.value.findIndex(item => item.id === rid), 1)
    ElMessage.success(res.msg)
  }
  loading.value = false
}

onBeforeMount(async () => {
  await getAllNormalResourceList(0)
})
</script>

<template>
  <tc-container-full-row>
    <el-table :data="dataList" v-loading="loading" height="450">
      <el-table-column type="index" fixed/>
      <el-table-column prop="id" label="资源RID" sortable/>
      <el-table-column prop="resource_name" label="资源名称"/>
      <el-table-column prop="deptInfo.dept_name" label="所属部门"
                       v-if="dataList.length !== 0 && dataList[0].hasOwnProperty('deptInfo')"/>
      <el-table-column prop="tagInfo.tag_name" label="分类标签"
                       v-if="dataList.length !== 0 && dataList[0].hasOwnProperty('tagInfo')"/>
      <el-table-column prop="upInfo.realName" label="上传者"/>
      <el-table-column prop="up_datetime" label="上传时间"/>
      <el-table-column label="操作" fixed="right" min-width="110">
        <template #default="scope">
          <el-button size="small" @click=editNormalResource(scope.row.id)>编辑</el-button>
          <el-button size="small" type="primary" @click="downloadResource(scope.row.id)">下载</el-button>
          <el-button size="small" type="danger" @click="deleteNormalResourceFromApi(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </tc-container-full-row><br/>
  <!--  分页器区域-->
  <tc-container-full-row style="margin-top: auto;">
    <tc-pagination :total="total" @page-current-change="getNewPageNumber"/>
  </tc-container-full-row>

</template>

<style scoped>
.el-pagination {
  justify-content: center;
}
</style>