<script setup>
import {useRouter} from "vue-router";
import {onBeforeMount, ref, watchEffect} from "vue";
import {withLoading} from "@/utils/functionUtil";
import {deleteTest, getTestPaperList, setRelease} from "@/api/learn-api";
import AddExamDialog from "@/view/teacher-view/exam/dialog/AddExamDialog.vue";
import {ElMessage, ElNotification} from "element-plus";
import EditExamDialog from "@/view/teacher-view/exam/dialog/EditExamDialog.vue";

const router = useRouter()
const lessonId = ref()
const loading = ref(false)


// 切换tab推送指定路由
const pushRoute = (index) => {
  if (index === 0) {
    router.push({
      path:'/teacher/exam',
      query:{lessonId:lessonId.value}
    })
  }else if (index === 1){
    router.push({
      path:'/teacher/exam/report',
      query:{lessonId:lessonId.value}
    })
  }
}


// 载入试卷列表
const testPaperList = ref([])
const originTestPaperList = ref([])
const loadingTestPaper = withLoading(async (pageSize, offset) => {
  testPaperList.value = []
  originTestPaperList.value = []
  const res = await getTestPaperList(sessionStorage.getItem('uid'), lessonId.value, pageSize, offset)
  if (res.code === 2002){
    testPaperList.value = res.data
    originTestPaperList.value = res.data
  }
}, loading)
watchEffect(async () => {
  if (router.currentRoute.value.query.lessonId){
    lessonId.value = router.currentRoute.value.query.lessonId
    await loadingTestPaper(10, 0)
  }
})


// 增加试卷
const showAddTestPaper = ref(false)
const closeAddTestPaper = async (des) => {
  showAddTestPaper.value = false
  if (des.split('-')[0] !== 'cancel') {
    await loadingTestPaper(10, 0)
  }
}


// 编辑试卷
const editTestPaper = (testId) => {
  router.push({
    path:'/teacher/test_paper',
    query:{
      testId:testId
    }
  })
}


// 发布试卷
const release = withLoading(async (testId) => {
  const res = await setRelease(testId)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    await loadingTestPaper(10, 0)
  }else {
    if (String(res.msg).includes("时间冲突")){
      setTimeout(() => {
        ElNotification({
          title: '时间冲突',
          message: res.msg,
          type: 'warning',
          duration:0,
          showClose:true
        })
      }, 3000)
    }
  }
}, loading)

// 编辑试卷信息
const showEditDialog = ref(false)
const closeEditTestInfo = async (des) => {
  showEditDialog.value = false
  if (des.split('-')[0] !== 'cancel') {
    await loadingTestPaper(10, 0)
  }
}
const testId = ref()
const titleInfo = ref()
const startDatetime = ref()
const endDatetime = ref()
const editTestInfo = (obj) => {

  testId.value = obj['id']
  titleInfo.value = obj['test_title']
  startDatetime.value = obj['start_datetime']
  endDatetime.value = obj['end_datetime']

  showEditDialog.value = true
}

// 删除试卷
const deleteTestPaper =  withLoading(async (testId) => {
  const res = await deleteTest(testId)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    await loadingTestPaper(10, 0)
  }
}, loading)


// 查询试卷
const searchKey = ref('')
const search = (keyword) => {
  keyword ? testPaperList.value = originTestPaperList.value.filter(item => item['test_title'].includes(keyword))
      : testPaperList.value = originTestPaperList.value
}


// 生命周期钩子
onBeforeMount(async () => {
  await loadingTestPaper(10, 0)
})
</script>

<template>
  <el-menu
      id="exam-tab"
      style="height: 10vh"
      :default-active="router.currentRoute.value.path.includes('report') ? '1' : '0'"
      text-color="#A8ABB2"
      active-text-color="#000000"
      mode="horizontal"
  >
    <el-menu-item index="0" @click="pushRoute(0)">制定试卷</el-menu-item>
    <el-menu-item index="1" @click="pushRoute(1)">评估报告</el-menu-item>
  </el-menu>
  <div v-if="!router.currentRoute.value.path.includes('/teacher/exam/report')">
    <el-card shadow="never" style="border: none">
      <el-row >
        <el-col :xs="21" :sm="21" :md="21" :lg="21" :xl="21">
          <el-button type="primary" @click="showAddTestPaper = true" v-btn>新建试卷</el-button>&nbsp;&nbsp;&nbsp;
          <el-input v-model="searchKey" @input="search"
                    :disabled="testPaperList.length === 0"
                    placeholder="请输入试卷名搜索" type="textarea" rows="1" style="border-radius: 0;width: 80%"/>
        </el-col>
      </el-row>
    </el-card>
    <el-card shadow="never" style="border-radius: 0;border-bottom: none;border-left: none" v-loading="loading">
      <el-table :data="testPaperList" stripe border empty-text="暂未编写任何试卷">
        <el-table-column prop="test_title" label="试卷名" />
        <el-table-column prop="start_datetime" label="考试开始时间" />
        <el-table-column prop="end_datetime" label="考试结束时间" />
        <el-table-column prop="isRelease" label="状态">
          <template #default="scope">
            <el-tag
                :type="scope.row['isRelease'] === 0 ? 'info' : 'success'"
                disable-transitions
            >{{ scope.row['isRelease'] === 0 ? '未发布考试' : '已发布考试' }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="scope">
            <el-row>
              <el-button size="small" @click="editTestInfo(scope.row)" v-btn>编辑</el-button>
              <el-button type="primary" size="small"
                         :disabled="scope.row['isRelease'] === 1"
                         @click="release(scope.row['id'])" v-btn>发布</el-button>
              <el-button size="small" type="primary" color="#333"
                         :disabled="scope.row['isRelease'] === 1"
                         @click="editTestPaper(scope.row['id'])" v-btn>编写试卷</el-button>
              <el-button type="danger" size="small" @click="deleteTestPaper(scope.row['id'])" v-btn>删除</el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

  </div>
  <router-view />

  <AddExamDialog :show-dialog="showAddTestPaper"
                 @close="closeAddTestPaper"/>
  <EditExamDialog v-if="showEditDialog" :show-dialog="showEditDialog"
                  :test-id="testId"
                  :title="titleInfo"
                  :start_datetime="startDatetime"
                  :end_datetime="endDatetime"
                  @close="closeEditTestInfo"/>
</template>

<style scoped>
#exam-tab{
  border-right: none;
}

/*noinspection CssUnusedSymbol*/
#exam-tab .el-menu-item.is-active{
  background-color: #f7f7f8;
}

/*noinspection CssUnusedSymbol*/
#exam-tab .el-menu-item:hover{
  background-color: transparent;
}
</style>