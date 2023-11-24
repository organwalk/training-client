<script setup>
import {useRouter} from "vue-router";
import {onBeforeMount, ref, watchEffect} from "vue";
import {withLoading} from "@/utils/functionUtil";
import {getTestPaperList} from "@/api/learn-api";
import AddExamDialog from "@/view/teacher-view/exam/dialog/AddExamDialog.vue";

const router = useRouter()
const lessonId = ref()
watchEffect(() => {
  if (router.currentRoute.value.query.lessonId){
    lessonId.value = router.currentRoute.value.query.lessonId
  }
})
const loading = ref(false)


// 载入试卷列表
const loadingTestPaper = withLoading(async (pageSize, offset) => {
  const res = await getTestPaperList(sessionStorage.getItem('uid'), lessonId.value, pageSize, offset)
  if (res.code === 2002){
    console.log(res.data)
  }
}, loading)


// 增加试卷
const showAddTestPaper = ref(false)
const closeAddTestPaper = async (des) => {
  showAddTestPaper.value = false
  if (des.split('-')[0] !== 'cancel') {
    await loadingTestPaper(10, 0)
  }
}



onBeforeMount(async () => {
  await loadingTestPaper(10, 0)
})

</script>

<template>
  <el-menu
      id="exam-tab"
      default-active="0"
      text-color="#A8ABB2"
      active-text-color="#000000"
      mode="horizontal"
  >
    <el-menu-item index="0" @click="router.push({
          path:'/teacher/exam',
          query:{lessonId:lessonId}
          })">制定试卷</el-menu-item>
    <el-menu-item index="1" @click="router.push({
          path:'/teacher/exam/report',
          query:{lessonId:lessonId}
          })">评估报告</el-menu-item>
  </el-menu>
  <div v-if="!router.currentRoute.value.path.includes('/teacher/exam/report')">
    <el-card shadow="never" style="border: none">
      <el-row >
        <el-col :xs="22" :sm="22" :md="22" :lg="21" :xl="22">
          <el-button type="primary" @click="showAddTestPaper = true" v-btn>新增试卷</el-button>&nbsp;&nbsp;&nbsp;
          <el-input placeholder="请输入试卷名搜索" type="textarea" rows="1" style="border-radius: 0;width: 80%"/>
        </el-col>
      </el-row>
    </el-card>
    <el-card shadow="never" style="border-radius: 0;border-bottom: none;border-left: none">
    </el-card>

  </div>
  <router-view />

  <AddExamDialog :show-dialog="showAddTestPaper"
                 @close="closeAddTestPaper"/>
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