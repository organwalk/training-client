<script setup>
import {ref, defineProps, watchEffect, defineEmits, reactive, watch} from "vue";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {secondsToMinutesSeconds} from "@/utils/dateUtil";
import {withButtonLoading} from "@/utils/functionUtil";
import {deleteVideoTest, editVideoTest} from "@/api/plan-api";
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";


const showGetVideoTestDialog = ref(false)
const props = defineProps({
  showGetVideoTestDialog: Boolean,
  testList:Array
})

watchEffect(() => {
  showGetVideoTestDialog.value = props.showGetVideoTestDialog
})
const emit = defineEmits(['closeGetVideoTestDialog'])
const closeDialog = (des) => {
  showGetVideoTestDialog.value = false
  emit('closeGetVideoTestDialog', des + '-' + Math.random())
}


// 定义测试题相关逻辑
const answerBox = ref()
const realList = ref([])
const testList = ref()  // 测试题列表
const testIndex = ref(0)  // 当前展示列表索引
const showTest = ref(true)   // 展示题目

watchEffect(() => {
  if (props.testList){
    realList.value = props.testList
  }
})
watch(realList, (newVal, oldVal) => {
  if (newVal.length !== oldVal.length && newVal.length !== 0){
    testList.value = newVal
  }
})

// 编辑测试题
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

// 展示编辑框
const edit = () => {
  showTest.value = false

  videoTest.test_title = testList.value[testIndex.value].test_title
  videoTest.test_options_a = testList.value[testIndex.value].test_options_a
  videoTest.test_options_b = testList.value[testIndex.value].test_options_b
  videoTest.test_options_c = testList.value[testIndex.value].test_options_c
  videoTest.test_options_d = testList.value[testIndex.value].test_options_d
  videoTest.test_options_answer = testList.value[testIndex.value].test_options_answer
  videoTest.test_time = testList.value[testIndex.value].test_time

  answerCheckList.value = videoTest.test_options_answer.split(',')
}

// 确认编辑
const buttonLoading = ref(false)
const submit = withButtonLoading(async () => {
  // 替换选项
  videoTest.test_options_answer = answerCheckList.value.join(',')
  // 请求编辑
  const res = await editVideoTest(testList.value[testIndex.value].id, videoTest)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    updateOldData()
    showTest.value = true
  }
}, buttonLoading)
const updateOldData = () => {
  // 更新题目列表的旧数据为修改后的数据
  testList.value[testIndex.value].test_title = videoTest.test_title
  testList.value[testIndex.value].test_options_a = videoTest.test_options_a
  testList.value[testIndex.value].test_options_b = videoTest.test_options_b
  testList.value[testIndex.value].test_options_c = videoTest.test_options_c
  testList.value[testIndex.value].test_options_d = videoTest.test_options_d
  testList.value[testIndex.value].test_options_answer = videoTest.test_options_answer
  testList.value[testIndex.value].test_time = videoTest.test_time
}

// 删除测试题
const router = useRouter()
const deleteTest = withButtonLoading(async () => {
  const testId= testList.value[testIndex.value].id
  const res = await deleteVideoTest(testId)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    closeDialog("delete")

    // 原地刷新
    if (router.currentRoute.value.fullPath.includes("isVideo")){
      window.location.href = router.currentRoute.value.fullPath
    }else {
      window.location.href = router.currentRoute.value.fullPath + '&isVideo=true'
    }

  }
}, buttonLoading)
</script>

<template>
  <el-dialog v-model="showGetVideoTestDialog"
             v-if="showGetVideoTestDialog"
             style="margin-top: 20px;"
             top="0"
             width="45%"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             title="视频测试题列表"
             :lock-scroll="false"
             destroy-on-close
  >
    <el-card style="margin-bottom: 10px" shadow="never" v-if="testList && testList.length > testIndex">
      <tc-container-full-row>
        <div v-show="showTest">
          <el-tag type="info">出现时间: {{ secondsToMinutesSeconds(testList[testIndex].test_time) }}</el-tag><br/><br/>
          <h3 style="margin-top: 0;margin-bottom: 0">
            （{{ testList.findIndex(obj => obj.id === testList[testIndex].id) + 1 }} / {{ testList.length }}）
            {{ testList[testIndex].test_title }}</h3><br/>
          <el-checkbox-group v-model="answerBox">
            <el-checkbox :label="'A.' + testList[testIndex].test_options_a"/>
            <br/>
            <el-checkbox :label="'B.' + testList[testIndex].test_options_b"/>
            <br/>
            <el-checkbox :label="'C.' + testList[testIndex].test_options_c"/>
            <br/>
            <el-checkbox :label="'D.' + testList[testIndex].test_options_d"/>
            <br/>
          </el-checkbox-group><br/>
          <el-text size="small">正确答案：{{ testList[testIndex].test_options_answer }}</el-text>
        </div>
        <div v-show="!showTest">
          <el-form :model="videoTest" label-width="70">
            <el-form-item label="题目描述">
              <el-input v-model="videoTest.test_title" type="textarea" rows="3" placeholder="请输入题目描述"/>
            </el-form-item>
            <el-form-item label="选项为 A">
              <el-input v-model="videoTest.test_options_a" type="textarea" rows="1" placeholder="请输入 A 选项答案"/>
            </el-form-item>
            <el-form-item label="选项为 B">
              <el-input v-model="videoTest.test_options_b" type="textarea" rows="1" placeholder="请输入 B 选项答案"/>
            </el-form-item>
            <el-form-item label="选项为 C">
              <el-input v-model="videoTest.test_options_c" type="textarea" rows="1" placeholder="请输入 C 选项答案"/>
            </el-form-item>
            <el-form-item label="选项为 D">
              <el-input v-model="videoTest.test_options_d" type="textarea" rows="1" placeholder="请输入 D 选项答案"/>
            </el-form-item>
            <el-form-item label="正确答案">
              <el-checkbox-group v-model="answerCheckList">
                <el-checkbox label="A" />
                <el-checkbox label="B" />
                <el-checkbox label="C" />
                <el-checkbox label="D" />
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </div>
      </tc-container-full-row>
    </el-card>
    <template #footer>
      <span class="dialog-footer" v-show="showTest">
        <el-button @click="deleteTest" type="danger" :loading="buttonLoading">删除</el-button>
        <el-button @click="closeDialog('cancel')"
                   :disabled="buttonLoading">关闭</el-button>
        <el-button @click="testIndex--"
                   v-show="testIndex !==  0"
                   :disabled="buttonLoading">上一题</el-button>
        <el-button @click="testIndex++"
                   v-show="testList.length !== testIndex + 1"
                   :disabled="buttonLoading">下一题</el-button>
        <el-button @click="edit" type="primary" color="#333"
                   :disabled="buttonLoading">编辑</el-button>
      </span>
      <span class="dialog-footer" v-show="!showTest">
        <el-button @click="showTest = true" :disabled="buttonLoading">取消</el-button>
        <el-button @click="submit" type="primary" color="#333" :loading="buttonLoading">提交</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>