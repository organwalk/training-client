<script setup>
import {ref, defineProps, defineEmits, watchEffect} from "vue";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {ElMessage} from "element-plus";

const props = defineProps({
  dialog:Boolean,
  testObj:Object
})
const emit = defineEmits(['close'])

const dialog = ref(false)
const answerType = ref('单选')
watchEffect(() => {
  dialog.value = props.dialog
  if (props.testObj){
    if (props.testObj.test_options_answer.split(',').length > 1){
      answerType.value = '多选'
    }
  }
})

const close = (des) => {
  answerBox.value = []
  answerStr.value = ''
  emit('close', des + '-' + Math.random() + '-' + props.testObj.id + '-' + props.testObj.test_time)
}


const answerBox = ref([])
const answerStr = ref()
watchEffect(() => {
  let answerList = answerBox.value.map(item => (String(item).split('.')[0])).sort()
  if (answerList.length > 1){
    answerStr.value = answerList.join(',')
  }else {
    answerStr.value = answerList[0]
  }
})

const submit = () => {
  if (answerStr.value === props.testObj.test_options_answer){
    ElMessage.success("回答正确")
    close('true')
  }else {
    ElMessage.error("回答错误")
  }
}
</script>

<template>
  <el-dialog v-model="dialog"
             v-if="dialog"
             style="margin-top: 50px;border-radius: 15px"
             top="0"
             width="45%"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             :lock-scroll="false"
             destroy-on-close
  >
    <template #header>
      <div class="card-header">
        <el-row style="display: flex; align-items: center;">
          <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18">
            <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;正确回答试题以继续观看</h3>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right;">
            <el-button @click="submit" round type="primary" color="#333">提交答案</el-button>
          </el-col>
        </el-row>
      </div>
    </template>
    <el-card style="border-radius: 10px" shadow="never">
      <tc-container-full-row>
        <h3 style="margin-top: 0;margin-bottom: 0">（{{ answerType }}）{{ testObj['test_title'] }}</h3><br/>
        <el-checkbox-group v-model="answerBox">
          <el-checkbox :label="'A. ' + testObj['test_options_a']"/><br/>
          <el-checkbox :label="'B. ' + testObj['test_options_b']"/><br/>
          <el-checkbox :label="'C. ' + testObj['test_options_c']"/><br/>
          <el-checkbox :label="'D. ' + testObj['test_options_d']"/><br/>
        </el-checkbox-group>
      </tc-container-full-row>
    </el-card>
  </el-dialog>
</template>

<style scoped>

</style>