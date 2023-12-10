<script setup>
import {ref, watchEffect} from "vue";
import {withLoading} from "@/utils/functionUtil";
import {getReportList, getTestPaperList} from "@/api/learn-api";
import {useRouter} from "vue-router";

// 加载
const loading = ref(false)


//路由
const router = useRouter()

// 加载试卷列表
const lessonId = ref()
const testList = ref([])
const testId = ref()
const loadingTestPaper = withLoading(async (pageSize, offset) => {
  const res = await getTestPaperList(sessionStorage.getItem('uid'), lessonId.value, pageSize, offset)
  if (res.code === 2002) {
    testList.value = res.data
    testId.value = testList.value[0]['id']
  } else {
    testList.value = []
    dataList.value = []
  }
}, loading)

watchEffect(async () => {
  if (router.currentRoute.value.query.lessonId){
    lessonId.value = router.currentRoute.value.query.lessonId
    await loadingTestPaper(999999, 0)
  }
})


// 切换试卷时
const whenChangeTestPaper = (element) => {
  testId.value = testList.value[element].id
}


// 获取评估报告
const emptyText = ref('暂无相关记录')
const dataList = ref([])
const originDataList = ref(dataList.value)
const loadingReport = withLoading(async () => {
  if (testList.value.length !== 0){
    const obj = testList.value.find(item => item['id'] === testId.value)
    if (new Date(obj['end_datetime']) < new Date()){
      const res = await getReportList(testId.value, 999999, 0)
      if (res.code === 2002) {
        dataList.value = res.data
        originDataList.value = res.data
      }
    }else {
      dataList.value = []
      originDataList.value = []
      emptyText.value = '考试尚未结束，无法查看评估报告'
    }
  }else {
    dataList.value = []
    originDataList.value = []
    emptyText.value = '考试尚未结束，无法查看评估报告'
  }
}, loading)

watchEffect(async () => {
  if (testId.value) {
    emptyText.value = '暂无相关记录'
    await loadingReport()
  }
})


// 等级Map映射表
const levelMap = {
  "优秀": "success",
  "合格": "info",
  "不及格": "danger"
}


// 过滤评级
const filterLevel = (value, row) => {
  return row.score.level === value
}


// 搜索学生
const searchKey = ref('')
const search = (keyword) => {
  keyword ? dataList.value = originDataList.value.filter(item => item['student_info']['real_name'].includes(keyword))
      : dataList.value = originDataList.value
}
</script>

<template>
  <div v-loading="loading">
    <el-row>
      <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" v-if="testList.length !== 0">
        <div style="height: 71vh">
          <el-menu
              id="test-list" style="height: 100vh" default-active="0" text-color="#A8ABB2" active-text-color="#000000"
              @select="whenChangeTestPaper"
          >
            <el-menu-item v-for="(item, index) in testList" :key="index" :index="String(index)">
              <span>{{ item.test_title }}</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-col>
      <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18">
        <div style="height: 71vh;margin-top: 10px;margin-left: 10px;margin-right: 10px">
          <el-input v-model="searchKey" @input="search" placeholder="搜索学员姓名" rows="1" type="textarea"
                    :disabled="dataList.length === 0"/>
          <el-table :data="dataList"
                    :default-sort="{ prop: 'score.composite_score', order: 'descending' }"
                    :empty-text="emptyText"
                    border style="margin-top: 10px">
            <el-table-column prop="student_info.real_name" label="学员姓名"/>
            <el-table-column label="评级"
                             :filters="[
        { text: '优秀', value: '优秀' },
        { text: '合格', value: '合格' },
        { text: '不及格', value: '不及格' }]"
                             :filter-method="filterLevel">
              <template #default="scope">
                <el-tag :type="levelMap[scope.row['score']['level']]">{{ scope.row['score']['level'] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="score.composite_score" label="综合得分" sortable/>
            <el-table-column prop="score.must_type_composite_score" label="必须题得分" sortable/>
            <el-table-column prop="score.important_type_composite_score" label="重要题得分" sortable/>
            <el-table-column prop="score.normal_type_composite_score" label="一般题得分" sortable/>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
#test-list {
  margin-right: 10px;
}

/*noinspection CssUnusedSymbol*/
#test-list .el-menu-item.is-active {
  background-color: #f7f7f8;
  border-radius: 5px;
}

/*noinspection CssUnusedSymbol*/
#test-list .el-menu-item:hover {
  background-color: transparent;
  color: #333333;
}
</style>