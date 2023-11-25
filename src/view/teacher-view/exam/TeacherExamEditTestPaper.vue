<script setup>
import {ArrowLeft, Close, Minus, Plus} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";
import {onBeforeMount, ref, watchEffect} from "vue";
import {withLoading} from "@/utils/functionUtil";
import {cacheTestPaper, getQuestionList} from "@/api/learn-api";
import {convertToObjectArray, getOptionLabel, getOptionObj} from "@/utils/dataUtil"
import {ElMessage} from "element-plus";

const loading = ref(false)
const isEmpty = ref(false)
const router = useRouter()
let testId


// 获取试题列表
const title = ref()
const time = ref()
const startTime = ref()
const score = ref(0)
const loadingQuestionList = withLoading(async () => {
  const res = await getQuestionList(testId)
  if (res.code === 2002) {
    title.value = res.data.test_title
    startTime.value = res.data.start_datetime
    time.value = res.data.start_datetime + " 至 " + res.data.end_datetime
    questions.value = res.data["questions"]
  } else {
    back()
  }
}, loading)
const back = () => {
  window.history.back()
}


// 获取试题类别
const getImportanceType = (val) => {
  if(val === 1) return 'danger'
  else if(val === 2) return 'warning'
  else return 'info'
}


// 增加试题
const questions = ref([])
watchEffect(() => {
  isEmpty.value = questions.value.length <= 0;
})
const showAdd = ref(false)
const questionContent = ref("")
const questionImportanceId = ref("")
const questionTrueAnswer = ref([])
const questionOptions = ref([
  {
    label: "选项A",
    content: ""
  },
  {
    label: "选项B",
    content: ""
  }
])
const questionIsMore = ref(0)
const importanceMap = {
  "必须": 1,
  "重要": 2,
  "一般": 3
}
const importanceValueMap = {
  "1": "必须",
  "2": "重要",
  "3": "一般"
}
const importanceScoreMap = {
  "必须": 10,
  "重要": 5,
  "一般": 3
}
const addQuestion = () => {
  questionImportanceId.value = importanceMap[questionImportanceId.value]
  if (questionTrueAnswer.value.length > 1) {
    questionIsMore.value = 1
  }
  const obj = {
    question: {
      content: questionContent.value,
      importance_id: questionImportanceId.value,
      true_answer: questionTrueAnswer.value.join(',')
    },
    options: getOptionObj(questionOptions.value),
    is_more: questionIsMore.value
  }
  questions.value.push(obj)
  clearAddQuestion()
  showAdd.value = false
}
const checkAllKeysHaveValues = (arrayOptions) => {
  return !questionContent.value || !questionImportanceId.value || questionTrueAnswer.value.length === 0 || checkContentEmpty(arrayOptions);
}
const checkContentEmpty = (array) => {
  for (let obj of array) {
    if (obj.content === '' || obj.content === undefined) {
      return true; // 如果找到空值，返回 true
    }
  }
  return false;
}

// 增加选项
const addOptions = () => {
  questionOptions.value.push({
    label: getOptionLabel(questionOptions.value),
    content: ""
  })
}

// 减少选项
const reduceOptions = () => {
  if (questionOptions.value.length > 2) {
    questionOptions.value.pop()
  } else {
    ElMessage.warning('必须至少具有两个选项')
  }
}

// 选择正确答案
const answerOptions = (array) => {
  return array.map(item => item.label.charAt(2))
}

// 数据初始化
const clearAddQuestion = () => {
  questionContent.value = ""
  questionImportanceId.value = ""
  questionTrueAnswer.value = []
  questionIsMore.value = 0
  questionOptions.value.length = 0
  questionOptions.value.push({
    label: "选项A",
    content: ""
  })
  questionOptions.value.push({
    label: "选项B",
    content: ""
  })
}


// 删除题目
const deleteQuestions = (index) => {
  questions.value.splice(index, 1)
}


// 暂存试卷
const saveTestPaper = withLoading(async () => {
  let obj = {
    test_title:title.value,
    start_datetime:startTime.value,
    end_datetime:time.value.split(' 至 ')[1],
    questions:questions.value
  }
  const res = await cacheTestPaper(testId, obj)
  if (res.code === 2002){
    ElMessage.success(res.msg)
  }
}, loading)


// 生命周期钩子
onBeforeMount(async () => {
  testId = router.currentRoute.value.query.testId
  await loadingQuestionList()
})
</script>

<template>
  <el-row>
    <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4"/>
    <el-col :xs="16" :sm="16" :md="16" :lg="16" :xl="16">
      <el-card shadow="never" style="border-radius: 0; border-top: none; border-bottom: none;margin-bottom: 15px"
               v-loading="loading">
        <template #header>
          <div class="card-header">
            <el-row style="display: flex; align-items: center;">
              <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1">
                <el-button @click="back" :icon="ArrowLeft" style="border: none" circle/>
              </el-col>
              <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
                <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;编写试卷详细</h3>
              </el-col>
              <el-col :xs="17" :sm="17" :md="17" :lg="17" :xl="17" style="text-align: right;">
                <el-button round @click="saveTestPaper" v-btn>暂存试卷</el-button>
                <el-button type="primary" color="#333" round v-btn>提交编写</el-button>
              </el-col>
            </el-row>
          </div>
        </template>
        <el-row style="display: flex; align-items: center;">
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" align="center">
            <el-tooltip
                effect="dark"
                content="试卷标题"
                placement="bottom"
            >
              <el-text>{{ title }}</el-text>
            </el-tooltip>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" align="center">
            <el-tooltip
                effect="dark"
                :content="'考试时间:' + time"
                placement="bottom"
            >
              <el-text>{{ startTime }}</el-text>
            </el-tooltip>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" align="center">
            <el-tooltip
                effect="dark"
                content="总分计算规则：依照权重：必须 -> 1、重要 -> 0.6、一般 -> 0.4和各类型所占分数10、5、3计算"
                placement="bottom"
            >
              <el-text>当前试题总分：
                <el-text type="primary" size="large">{{ score }}</el-text>
              </el-text>
            </el-tooltip>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" align="center">
            <el-button @click="showAdd = true" type="primary" text>增加试题</el-button>
          </el-col>
        </el-row>
        <el-divider/>
        <el-empty v-if="isEmpty" description="未编写任何试题"/>
        <div style="height: 80vh; overflow-y: auto" v-if="!isEmpty">
          <el-row>
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-card shadow="never" v-for="(item, index) in questions" :key="index">
                <template #header>
                  <div class="card-header">
                    <el-row style="display: flex; align-items: center;">
                      <el-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2">
                        <!--suppress JSValidateTypes -->
                        <el-tag :type="getImportanceType(item.question.importance_id)">{{ importanceValueMap[item.question.importance_id] }}类型</el-tag>
                      </el-col>
                      <el-col :xs="5" :sm="5" :md="5" :lg="5" :xl="5">
                        <el-text style="margin-left: 10px">分值：
                          <el-text type="primary">{{ importanceScoreMap[importanceValueMap[item.question.importance_id]] }}分</el-text>
                        </el-text>
                      </el-col>
                      <el-col :xs="17" :sm="17" :md="17" :lg="17" :xl="17" style="text-align: right;">
                        <el-button type="danger" round size="small" @click="deleteQuestions(index)" v-btn>删除此题</el-button>
                        <el-button type="primary" round size="small" v-btn>编辑此题</el-button>
                      </el-col>
                    </el-row>
                  </div>
                </template>
                <span>1.&nbsp;&nbsp;</span>
                <el-text size="large">{{ item.question.content }}</el-text>
                <br/><br/>
                <div v-for="(item, index) in convertToObjectArray(item.options)" :key="index">
                  <span style="color: transparent">1.&nbsp;&nbsp;</span>
                  <el-text>{{ item.option }}.{{ item.content }}</el-text>
                  <br/>
                </div>
                <div><br/><span style="color: transparent">1.&nbsp;&nbsp;</span>
                  <el-text>正确答案：{{ item.question.true_answer }}</el-text>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </el-col>
    <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4"/>
  </el-row>


  <el-dialog v-model="showAdd"
             v-if="showAdd"
             style="margin-top: 20px;border-radius: 15px"
             top="0"
             width="50%"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             :lock-scroll="false"
             :destroy-on-close="true">
    <template #header>
      <div class="card-header">
        <el-row style="display: flex; align-items: center;">
          <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1">
            <el-button @click="showAdd = false" :icon="Close" style="border: none" circle/>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
            <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;添加试题</h3>
          </el-col>
          <el-col :xs="17" :sm="17" :md="17" :lg="17" :xl="17" style="text-align: right;">
            <el-button type="primary" color="#333" round @click="addQuestion"
                       :disabled="checkAllKeysHaveValues(questionOptions)">确认添加
            </el-button>
          </el-col>
        </el-row>
      </div>
    </template>
    <el-card shadow="never" style="border-radius: 10px;margin-top: -10px;height: 80vh;overflow-y: auto">
      <el-form label-position="top">
        <el-form-item label="题目描述文字">
          <el-input v-model="questionContent" type="textarea" rows="3" show-word-limit maxlength="200"/>
        </el-form-item>
        <el-form-item label="题目类别">
          <el-radio-group v-model="questionImportanceId" size="large">
            <el-radio-button label="必须"/>
            <el-radio-button label="重要"/>
            <el-radio-button label="一般"/>
          </el-radio-group>
        </el-form-item>
        <el-divider content-position="left">题目选项</el-divider>
        <el-form-item v-for="(item, index) in questionOptions" :key="index" :label="item.label">
          <el-input v-model="item.content" type="textarea" rows="1" show-word-limit maxlength="50"/>
        </el-form-item>
        <el-row>
          <el-button :icon="Plus" @click="addOptions">增加选项</el-button>
          <el-button :icon="Minus" @click="reduceOptions">减少选项</el-button>
        </el-row>
        <br/><br/>
        <el-form-item label="正确答案">
          <el-checkbox-group v-model="questionTrueAnswer">
            <el-checkbox v-for="(item, index) in answerOptions(questionOptions)" :key="index" :label="item"/>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </el-card>
  </el-dialog>
</template>

<style scoped>

</style>