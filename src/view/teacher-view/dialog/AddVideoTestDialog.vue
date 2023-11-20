<script setup>
import {ref, defineProps, watchEffect, defineEmits, reactive} from "vue";
import {withButtonLoading} from "@/utils/functionUtil";
import {addVideoTest} from "@/api/plan-api";
import {ElMessage} from "element-plus";

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
}

</script>

<template>
  <el-dialog v-model="showAddVideoTestDialog"
             v-if="showAddVideoTestDialog"
             style="margin-top: 20px"
             top="0"
             width="45%"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             title="添加视频测试题"
             :lock-scroll="false"
             destroy-on-close
  >
    <el-form :model="videoTest" label-width="70">
      <el-form-item label="题目描述">
        <el-input v-model="videoTest.test_title" type="textarea" rows="3" placeholder="请输入题目描述"/>
      </el-form-item>
      <el-form-item label="选项为A">
        <el-input v-model="videoTest.test_options_a" type="textarea" rows="1" placeholder="请输入A选项答案"/>
      </el-form-item>
      <el-form-item label="选项为B">
        <el-input v-model="videoTest.test_options_b" type="textarea" rows="1" placeholder="请输入B选项答案"/>
      </el-form-item>
      <el-form-item label="选项为C">
        <el-input v-model="videoTest.test_options_c" type="textarea" rows="1" placeholder="请输入C选项答案"/>
      </el-form-item>
      <el-form-item label="选项为D">
        <el-input v-model="videoTest.test_options_d" type="textarea" rows="1" placeholder="请输入D选项答案"/>
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
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog('cancel')" :disabled="buttonLoading">取消</el-button>
        <el-button @click="submit" type="primary" color="#333" :loading="buttonLoading">添加</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>