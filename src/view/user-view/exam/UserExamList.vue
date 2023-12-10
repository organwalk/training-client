<script setup>
import {onBeforeMount, ref, watch} from "vue";
import {useRouter} from "vue-router";
import {withLoading} from "@/utils/functionUtil";
import {getOverTestPaperState, getTestPaperByStudent} from "@/api/learn-api";
import {isEarlierThanCurrentTime, isLaterThanCurrentTime, isMiddleCurrentTime} from "@/utils/dateUtil";
import UserExamListReportDialog from "@/view/user-view/exam/dialog/UserExamListReportDialog.vue";

const loading = ref(false)
const nowType = ref(0)
const router = useRouter()
const teacherId = ref(router.currentRoute.value.query.teacherId)
const lessonId = ref(router.currentRoute.value.query.lessonId)


// 加载试卷列表
const testPaperList = ref([])
const loadingTestPaper = withLoading(async (type) => {
  const res = await getTestPaperByStudent(teacherId.value, lessonId.value, type)
  if (res.code === 2002) {
    testPaperList.value = res.data
    const uid = sessionStorage.getItem("uid")
    for (const item of testPaperList.value) {
      if (isMiddleCurrentTime(item['start_datetime'], item['end_datetime'])) {
        const stateRes = await getOverTestPaperState(uid, item['id']);
        if (stateRes.code === 2002) {
          item.state = stateRes.data
        }
      }
    }
  } else {
    testPaperList.value = []
  }
}, loading)

// 监听tab，切换到新tab时，加载新的数据
watch(nowType, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    await loadingTestPaper(newVal)
  }
})


// 查看成绩对话框
const reportDialog = ref(false)
const closeReportDialog = (des) => {
  if (des) reportDialog.value = false
}
const nowTestId = ref()

const pageLoading = ref(false)
onBeforeMount(async () => {
  pageLoading.value = true
  await loadingTestPaper(0)
  pageLoading.value = false
})
</script>

<template>
  <el-progress :percentage="50" color="#333" :duration="1" :indeterminate="true" :show-text="false" v-if="pageLoading"/>
  <el-row style="height: 90vh" v-show="!pageLoading">
    <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
      <el-card shadow="never"
               style="border-radius: 0; height: 90vh;border-top: none;border-left: none;border-bottom: none;overflow-y: auto">
        <el-menu
            id="test-paper-list"
            default-active="0"
            text-color="#A8ABB2"
            active-text-color="#000000"
        >
          <el-menu-item index="0">
            试卷列表
          </el-menu-item>
        </el-menu>
      </el-card>
    </el-col>
    <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18">
      <el-card shadow="never"
               style="height: 90vh;
                   font-family: 微软雅黑,serif;
                   border-top: none;border-left: none;border-bottom: none;overflow-y: auto">
        <el-row style="height: 5vh">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-button :type="nowType === 0 ? 'primary' : ''" :color="nowType === 0 ? '#333333' : ''"
                       @click="nowType = 0"
                       round v-btn>全部试卷
            </el-button>
            <el-button :type="nowType === 1 ? 'primary' : ''" :color="nowType === 1 ? '#333333' : ''"
                       @click="nowType = 1"
                       round v-btn>待考试
            </el-button>
            <el-button :type="nowType === 2 ? 'primary' : ''" :color="nowType === 2 ? '#333333' : ''"
                       @click="nowType = 2"
                       round v-btn>已结束
            </el-button>
          </el-col>
        </el-row>
        <br/>
        <el-row v-loading="loading">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-table empty-text="尚无试卷" :data="testPaperList" border>
              <el-table-column type="index"/>
              <el-table-column prop="test_title" label="试卷名称"/>
              <el-table-column prop="start_datetime" label="开始时间"/>
              <el-table-column prop="end_datetime" label="结束时间"/>
              <el-table-column prop="creat_datetime" label="发布时间"/>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-tag type="info" v-if="isLaterThanCurrentTime(scope.row.start_datetime)">尚未开始</el-tag>
                  <el-button type="primary" size="small"
                             v-if="typeof scope.row.state === 'boolean' && !scope.row.state"
                             @click="router.push({
                             path:'/user/test',
                             query:{
                               testId:scope.row.id
                             }
                             })">进入考试
                  </el-button>
                  <el-tooltip
                      effect="dark"
                      content="考试结束五分钟后可查看成绩"
                      placement="top"
                      v-if="typeof scope.row.state === 'boolean' && scope.row.state"
                  >
                    <el-tag type="success">已完成考试</el-tag>
                  </el-tooltip>
                  <el-button type="primary" size="small"
                             v-show="isEarlierThanCurrentTime(scope.row.end_datetime)"
                             @click="reportDialog = true;nowTestId = (scope.row.id)"
                             text v-btn>查看成绩
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>

  <UserExamListReportDialog :dialog="reportDialog" :test-id="nowTestId"
                            @close="closeReportDialog"/>
</template>

<style scoped>
#test-paper-list {
  border-right: none;
}

/*noinspection CssUnusedSymbol*/
#test-paper-list .el-menu-item.is-active {
  background-color: #f7f7f8;
  border-radius: 5px;
}

/*noinspection CssUnusedSymbol*/
#test-paper-list .el-menu-item:hover {
  background-color: transparent;
  color: #333333;
}
</style>