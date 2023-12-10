<script setup>
import {ref, watchEffect} from "vue";
import {withLoading} from "@/utils/functionUtil";
import {getAvgScoreList, getTestPaperList} from "@/api/learn-api";
import {useRouter} from "vue-router";

const router = useRouter()
const loading = ref(false)


// 成绩列表
const dataList = ref([])
const originDataList = ref([])
const loadingDataList = withLoading(async () => {
  const res = await getAvgScoreList(lessonId.value, 999999, 0)
  if (res.code === 2002){
    dataList.value = res.data
    originDataList.value = res.data
  }else {
    dataList.value = []
    originDataList.value = []
  }
}, loading)


// 加载试卷名列表
const loadingTestPaper = withLoading(async (pageSize, offset) => {
  const res = await getTestPaperList(sessionStorage.getItem('uid'), lessonId.value, pageSize, offset)
  if (res.code === 2002) {
    const result = res.data.map(item => ({id: item.id, testTitle: item.test_title}))
    dataList.value.forEach(item => {
      const fined = result.find(obj => obj.id === item['test_id'])
      if (fined) item.test_title = fined.testTitle
    })
  }
}, loading)

// 获取课程ID
const lessonId = ref()
watchEffect(async () => {
  if (router.currentRoute.value.query.lessonId) {
    lessonId.value = router.currentRoute.value.query.lessonId
    await loadingDataList()
    if (dataList.value.length !== 0){
      await loadingTestPaper(999999, 0)
    }
  }
})


// 查询试卷
const searchKey = ref('')
const search = (keyword) => {
  keyword ? dataList.value = originDataList.value.filter(item => item['test_title'].includes(keyword))
      : dataList.value = originDataList.value
}


</script>

<template>
  <el-card shadow="never"
           :body-style="{paddingLeft:'0',paddingRight:'0',paddingTop:'10px'}"
           style="border-radius: 0;border-top: 0;border-bottom: 0;" v-loading="loading">
    <div style="height: 71vh;margin-top: 10px;margin-left: 10px;margin-right: 10px">
      <el-input placeholder="输入试卷名进行查询" rows="1" type="textarea"
                v-model="searchKey" :disabled="dataList.length === 0"
                @input="search" />
      <el-table :data="dataList"
                :default-sort="{ prop: 'avg_composite_score', order: 'descending' }"
                style="margin-top: 10px" empty-text="暂无记录" v-show="!loading"
                border>
        <el-table-column prop="test_title" label="试卷名"/>
        <el-table-column prop="avg_composite_score" label="平均综合得分" sortable/>
        <el-table-column prop="avg_must_type_composite_score" label="平均必须题得分" sortable/>
        <el-table-column prop="avg_important_type_composite_score" label="平均重要题得分" sortable/>
        <el-table-column prop="avg_normal_type_composite_score" label="平均一般题得分" sortable/>
      </el-table>
    </div>
  </el-card>
</template>

<style scoped>

</style>