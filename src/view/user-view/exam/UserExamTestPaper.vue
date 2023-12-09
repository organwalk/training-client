<script setup>
import {useRouter} from "vue-router";
import {ref, watchEffect} from "vue";
import {getOverTestPaperState, getQuestionList, writeTestPaper} from "@/api/learn-api";
import {convertToObjectArray} from "@/utils/dataUtil";
import {ElMessage} from "element-plus";

const router = useRouter()
const pageLoading = ref(false)

// 加载试卷
const testTitle = ref()
const time = ref()
const questions = ref([])
const loadingTestPaper = async (testId) => {
  const res = await getQuestionList(testId)
  if (res.code === 2002) {
    testTitle.value = res.data.test_title
    time.value = new Date(res.data.end_datetime).getTime()
    questions.value = res.data.questions
    ElMessage.success("试卷已成功加载，正在监视考试行为")
    setBlurCounter(1)
  }
}


// 选择答案
const selectedOptions = ref([])
const getCheckboxValue = (id, option) => {
  // 返回需要作为 label 值的对象
  return {
    q_id: id,
    answer: option
  }
}


// 提交试卷
const submitLoading = ref(false)
const submit = async () => {
  let copySelectedOptions = [...selectedOptions.value]
  copySelectedOptions.forEach((item, index) => {
    if (item.length > 1){
      const uniqueAnswers = new Set();
      const updatedAnswers = [];
      item.forEach(obj => {
        const answer = obj['answer'];
        if (!uniqueAnswers.has(answer)) {
          uniqueAnswers.add(answer);
          updatedAnswers.push(answer);
        }
      });
      copySelectedOptions[index][0]['answer'] = updatedAnswers.join(',');
    }
    copySelectedOptions[index] = item[0];
  })
  if (copySelectedOptions.length !== questions.value.length){
    ElMessage.warning("尚有题目未作答，无法提交")
  }else {
    submitLoading.value = true
    const res = await writeTestPaper(router.currentRoute.value.query.testId, sessionStorage.getItem("uid"), {answers:copySelectedOptions})
    if (res.code === 2002){
      removeBlur()
      ElMessage.success(res.msg)
      router.back()
    }
    submitLoading.value = false
  }
}


// 防作弊设计
const setBlurCounter = (num) => {
  sessionStorage.setItem("blurCounter", num)
}
const removeBlur = () => {
  sessionStorage.removeItem("blurCounter")
  window.removeEventListener('blur', whenBlur);
}
const whenBlur = async () => {
  let counter = Number(sessionStorage.getItem("blurCounter"))
  if (counter > 1){
    await writeTestPaper(router.currentRoute.value.query.testId, sessionStorage.getItem("uid"), {answers:[{q_id:null,answer:null}]})
    ElMessage.warning({
      type:'warning',
      message:'由于您多次离开考试页面，本次考试您被判为零分卷',
      duration:0,
      showClose:true
    });
    removeBlur()
    router.back()
  }else {
    ElMessage.warning({
      type:'warning',
      message:'您离开了考试页面。如果您再次尝试离开，本次考试您将被判为零分卷',
      duration:0,
      showClose:true
    });
    setBlurCounter(counter + 1)
  }
}
window.addEventListener('blur', whenBlur);



watchEffect(async () => {
  if (router.currentRoute.value.query.testId) {
    // 获取正在进行考试的作答状态
    pageLoading.value = true
    const res = await getOverTestPaperState(sessionStorage.getItem("uid"), router.currentRoute.value.query.testId)
    if (res.code === 2002){
      if (res.data){
        ElMessage.warning("勿重复作答")
        removeBlur()
        router.back()
      }else {
        await loadingTestPaper(router.currentRoute.value.query.testId)
      }
    }else {
      ElMessage.warning("勿重复作答")
      removeBlur()
      router.back()
    }
    pageLoading.value = false
  }
})


</script>

<template>
  <el-progress :percentage="50" color="#333" :duration="1" :indeterminate="true" :show-text="false" v-if="pageLoading"/>
  <el-row v-show="!pageLoading">
    <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4"/>
    <el-col :xs="16" :sm="16" :md="16" :lg="16" :xl="16">
      <el-card style="border-top: none;border-radius:0;user-select: none" shadow="never">
        <template #header>
          <div class="card-header">
            <el-row style="display: flex; align-items: center;">
              <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
                <el-countdown
                    title="考试时间"
                    format="HH:mm:ss"
                    :value="time"
                />
              </el-col>
              <el-col :xs="16" :sm="16" :md="16" :lg="16" :xl="16" align="center">
                <el-statistic title="试卷名称" :value-style="{display:'none'}">
                  <template #suffix>
                    <span>{{ testTitle }}</span>
                  </template>
                </el-statistic>
              </el-col>
              <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4" style="text-align: right;">
                <el-button type="primary" color="#333333"
                           :loading="submitLoading"
                           @click="submit"
                           round v-btn>提交试卷</el-button>
              </el-col>
            </el-row>
          </div>
        </template>
        <el-card style="margin-bottom: 15px" shadow="never" v-for="(item, index) in questions" :key="index">
          <span>{{ index + 1 }}.&nbsp;</span>
          <el-text size="large">{{ item.content }}</el-text><br/>
          <el-tag size="small" :type="item.is_more === 0 ? 'info' : 'primary'">{{ item.is_more === 0 ? '单选' : '多选' }}</el-tag>
          <br/><br/>
          <el-checkbox-group v-model="selectedOptions[index]" :max="item.is_more === 0 ? 1 : 26">
            <div v-for="(answerItem, answerIndex) in convertToObjectArray(item.options)" :key="answerIndex">
              <el-checkbox :label="getCheckboxValue(item.id, answerItem.option)">
                {{ answerItem.option }}.{{ answerItem.content }}
              </el-checkbox>
              <br/>
            </div>
          </el-checkbox-group>
        </el-card>
      </el-card>
    </el-col>
    <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4"/>
  </el-row>

  <el-backtop :right="130" :bottom="100" style="color: #333"/>
</template>

<style scoped>

</style>