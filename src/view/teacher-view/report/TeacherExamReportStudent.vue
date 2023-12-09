<script setup>
import {onBeforeMount, ref, watchEffect} from "vue";
import {withLoading} from "@/utils/functionUtil";
import {getTestPaperList} from "@/api/learn-api";
import {useRouter} from "vue-router";

// 加载
const loading = ref(false)


//路由
const router = useRouter()


// 获取试卷列表
const testList = ref()
const loadingTestPaper = withLoading(async (pageSize, offset) => {
  const res = await getTestPaperList(sessionStorage.getItem('uid'), lessonId.value, pageSize, offset)
  if (res.code === 2002) {
    testList.value = res.data
  }
}, loading)


// 获取课程ID
const lessonId = ref()
watchEffect(async () => {
  if (router.currentRoute.value.query.lessonId) {
    lessonId.value = router.currentRoute.value.query.lessonId
    await loadingTestPaper(10, 0)
  }
})


// 切换试卷时
const whenChangeTestPaper = (element) => {
  const id = testList[element].id
  console.log(id)
}


// 获取评估报告表格
const dataList = ref([
  {
    "student_info": {
      "id": 1,
      "real_name": "张三"
    },
    "score": {
      "composite_score": 80,
      "must_type_composite_score": 50,
      "important_type_composite_score": 20,
      "normal_type_composite_score": 10,
      "level": "优秀"
    }
  },
  {
    "student_info": {
      "id": 21,
      "real_name": "李四"
    },
    "score": {
      "composite_score": 60,
      "must_type_composite_score": 20,
      "important_type_composite_score": 30,
      "normal_type_composite_score": 10,
      "level": "合格"
    }
  },
  {
    "student_info": {
      "id": 31,
      "real_name": "王五"
    },
    "score": {
      "composite_score": 50,
      "must_type_composite_score": 20,
      "important_type_composite_score": 20,
      "normal_type_composite_score": 10,
      "level": "未通过"
    }
  }
])
const originDataList = ref(dataList.value)

// 等级Map映射表
const levelMap = {
  "优秀": "success",
  "合格": "info",
  "未通过": "danger"
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

onBeforeMount(async () => {
  await loadingTestPaper(999999, 0)
})
</script>

<template>
  <div v-loading="loading">
    <el-row>
      <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
        <div style="height: 71vh">
          <el-menu
              id="test-list"
              style="height: 100vh"
              default-active="0"
              text-color="#A8ABB2"
              active-text-color="#000000"
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
          <el-input v-model="searchKey" @input="search" placeholder="搜索学员姓名" rows="1" type="textarea"/>
          <el-table :data="dataList"
                    :default-sort="{ prop: 'score.composite_score', order: 'descending' }"
                    border style="margin-top: 10px">
            <el-table-column prop="student_info.real_name" label="学员姓名"/>
            <el-table-column label="评级"
                             :filters="[
        { text: '优秀', value: '优秀' },
        { text: '合格', value: '合格' },
        { text: '未通过', value: '未通过' }]"
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