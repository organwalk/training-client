<script setup>
import {defineProps, ref, watch, watchEffect} from "vue";
import {Delete, Edit,} from '@element-plus/icons-vue'
import {withLoading} from "@/utils/functionUtil";
import {deleteChapterById, getLessonChapterList} from "@/api/plan-api";
import {ElMessage} from "element-plus";
import {setObjectListPID} from "@/utils/dataUtil";
import {useRouter} from "vue-router";
import {getResourceLessonRid} from "@/api/resource-api";



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
    await loadingResourceLessonList(result)
  }else {
    dataList.value = []
  }
}, loading)

// 载入资源列表
const loadingResourceLessonList = async (chapterList) => {
  const res = await getResourceLessonRid(lessonId.value)
  if (res.code === 2002){
    const process_result = chapterList.map(c_item => {
      const updatedItem = { ...c_item }; // 创建一个新对象以避免直接修改原始数据
      const foundRItem = res.data.find(r_item => r_item.chapterId === c_item.id);
      if (foundRItem) {
        updatedItem.r_id = foundRItem.id;
        updatedItem.up_datetime = foundRItem.up_datetime;
      }
      return updatedItem;
    });
    dataList.value = process_result
    originDataList.value = process_result
  }else {
    dataList.value = chapterList
    originDataList.value = chapterList
  }
}


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


// 进行章节编辑
const router = useRouter()
const editChapter = (chapterId, chapterName, resourceId) => {
  router.push({
    path: '/teacher/edit',
    query: {
      lesson_id:lessonId.value,
      chapter_id: chapterId,
      chapter_name: chapterName,
      resource_id: resourceId
    }
  })
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
                         @click="editChapter(row.id, row.chapterName, row.r_id)">Edit</el-button>
              <el-button :icon="Delete" style="background-color: transparent" @click="deleteChapter(row.id)"/>
            </el-col>
          </el-row>
        </el-card>
      </template>
    </el-table-column>
  </el-table>
</template>



<style scoped>

</style>