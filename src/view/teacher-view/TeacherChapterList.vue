<script setup>
import {defineProps, ref, watch, watchEffect} from "vue";
import {Delete, Edit,} from '@element-plus/icons-vue'
import {withLoading} from "@/utils/functionUtil";
import {deleteChapterById, getLessonChapterList} from "@/api/plan-api";
import {ElMessage} from "element-plus";
import {setObjectListPID} from "@/utils/dataUtil";
import UpdateChapterDialog from "@/view/teacher-view/dialog/UpdateChapterDialog.vue";



// 定义全局变量
const loading = ref(false)
const props = defineProps({
  lessonId:String,
  isRefresh:Boolean,
  keyword:String,
  isReverse:Number
})


// 载入数据集
const dataList = ref()
const originDataList = ref()
const loadingDataList = withLoading(async () => {
  const res = await getLessonChapterList(lessonId.value)
  if (res.code === 2002){
    const result = setObjectListPID(res.data).reverse()
    dataList.value = result
    originDataList.value = result
  }else {
    dataList.value = []
  }
}, loading)


// 监听器
const lessonId = ref('')
const isRefresh = ref(false)
const keyword = ref('')
const isReverse = ref()

// 响应式赋值props
watchEffect(() => {
  lessonId.value = props.lessonId
  isRefresh.value = props.isRefresh
  keyword.value = props.keyword
  isReverse.value = props.isReverse
})

// 当课程ID变动时，请求相应的章节列表
watchEffect(async () => {
  if (lessonId.value) {
    await loadingDataList()
  }
})

// 是否强制刷新章节列表
watchEffect(async () => {
  if (isRefresh.value){
    await loadingDataList()
  }
})

// 根据关键词进行搜索
watchEffect(async () => {
  if (keyword.value){
    dataList.value = originDataList.value.filter(item => {
      return item.chapterName.toLowerCase().includes(String(keyword.value).toLowerCase());
    })
  }else if (keyword.value === ''){
    dataList.value = originDataList.value
  }
})

watch(isReverse, (newVal, oldValue) => {
  if (newVal !== oldValue){
    dataList.value.reverse()
  }
})


// 删除指定章节
const deleteChapter = withLoading(async (chapterId) => {
  const res = await deleteChapterById(chapterId)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    await loadingDataList()
  }
}, loading)


// 控制对话框
const showUpdateChapterDialog = ref(false)
const chooseChapterName = ref('')
const closeUpdateChapterDialog = async (des) => {
  showUpdateChapterDialog.value = false
  if (des.split('-')[0] !== 'cancel'){
    await loadingDataList()
  }
}
</script>

<template>
  <el-table :data="dataList" v-loading="loading" :show-header="false">
    <el-table-column prop="p_id" width="50px"/>
    <el-table-column >
      <template v-slot="{ row }">
        <el-card shadow="never" :body-style="{paddingTop:'10px', paddingBottom:'10px'}"
                 style="border: none;background-color: #f6f8fa;">
          <el-row>
            <el-col :xs="16" :sm="16" :md="16" :lg="16" :xl="16" style="display: flex;align-items: center">
              <el-text style="font-weight: bold;">{{row.chapterName}}</el-text>
            </el-col>
            <el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8" align="right">
              <el-button :icon="Edit" style="background-color: transparent"
                         @click="showUpdateChapterDialog = true;chooseChapterName = row.chapterName">Edit</el-button>
              <el-button :icon="Delete" style="background-color: transparent" @click="deleteChapter(row.id)"/>
            </el-col>
          </el-row>
        </el-card>
      </template>
    </el-table-column>
  </el-table>

  <update-chapter-dialog :show-update-chapter-dialog="showUpdateChapterDialog"
                         :chapter-name="chooseChapterName"
                         @close-update-chapter-dialog="closeUpdateChapterDialog"/>
</template>



<style scoped>

</style>