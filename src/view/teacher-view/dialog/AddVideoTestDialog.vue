<script setup>
import {ref, defineProps, watchEffect, defineEmits, reactive} from "vue";
import {withButtonLoading} from "@/utils/functionUtil";
import {addVideoTest} from "@/api/plan-api";
import {ElMessage} from "element-plus";
import {Close} from "@element-plus/icons-vue";

// 定义全局变量
const props = defineProps({
  showAddVideoTestDialog: Boolean,
  currentTime: Number,
  resourceId: Number
})
const emit = defineEmits(['closeDialog'])
const showAddVideoTestDialog = ref(false)
const currentTime = ref()
watchEffect(() => {
  showAddVideoTestDialog.value = props.showAddVideoTestDialog
  currentTime.value = props.currentTime
})
const closeDialog = (des) => {
  clearVideoTest()
  showAddVideoTestDialog.value = false
  emit('closeDialog', des + '-' + Math.random())
}


// 定义增加视频测试题逻辑
const answerCheckList = ref([])
const videoTest = reactive({
  test_title: '',
  test_options_a: '',
  test_options_b: '',
  test_options_c: '',
  test_options_d: '',
  test_options_answer: '',
  test_time: 0
})
const buttonLoading = ref(false)

const submit = withButtonLoading(async () => {
  videoTest.test_options_answer = answerCheckList.value.join(',')
  videoTest.test_time = currentTime.value
  const res = await addVideoTest(props.resourceId, videoTest)
  if (res.code === 2002) {
    ElMessage.success(res.msg)
    closeDialog('add')
  }
}, buttonLoading)

const clearVideoTest = () => {
  videoTest.test_title = ''
  videoTest.test_options_a = ''
  videoTest.test_options_b = ''
  videoTest.test_options_c = ''
  videoTest.test_options_d = ''
  videoTest.test_options_answer = ''
  videoTest.test_time = 0
  answerCheckList.value = []
}

</script>

<template>
  <el-dialog v-model="showAddVideoTestDialog"
             v-if="showAddVideoTestDialog"
             style="margin-top: 20px;border-radius: 15px"
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
          <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1">
            <el-button @click="closeDialog('cancel')" :disabled="buttonLoading" :icon="Close" style="border: none" circle/>
          </el-col>
          <el-col :xs="17" :sm="17" :md="17" :lg="17" :xl="17">
            <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;添加视频测试题</h3>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right;">
            <el-button @click="submit" type="primary" color="#333" :loading="buttonLoading" round>确认添加</el-button>
          </el-col>
        </el-row>
      </div>
    </template>
    <el-card shadow="never" style="border-radius: 10px;margin-top: -15px;">
      <el-form :model="videoTest" label-position="top">
        <el-form-item label="题目描述">
          <el-input v-model="videoTest.test_title" type="textarea" rows="2" placeholder="请输入题目描述"/>
        </el-form-item>
        <el-form-item label="选项 A">
          <el-input v-model="videoTest.test_options_a" type="textarea" rows="1" placeholder="请输入 A 选项答案"/>
        </el-form-item>
        <el-form-item label="选项 B">
          <el-input v-model="videoTest.test_options_b" type="textarea" rows="1" placeholder="请输入 B 选项答案"/>
        </el-form-item>
        <el-form-item label="选项 C">
          <el-input v-model="videoTest.test_options_c" type="textarea" rows="1" placeholder="请输入 C 选项答案"/>
        </el-form-item>
        <el-form-item label="选项 D">
          <el-input v-model="videoTest.test_options_d" type="textarea" rows="1" placeholder="请输入 D 选项答案"/>
        </el-form-item>
        <el-form-item label="正确答案">
          <el-checkbox-group v-model="answerCheckList">
            <el-checkbox label="A"/>
            <el-checkbox label="B"/>
            <el-checkbox label="C"/>
            <el-checkbox label="D"/>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </el-card>
  </el-dialog>
</template>

<style scoped>
/deep/ .el-textarea__inner {
  resize: none;
}
</style>