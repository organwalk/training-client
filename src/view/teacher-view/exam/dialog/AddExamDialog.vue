<script setup>
import {ref, defineProps, defineEmits, watchEffect, reactive} from "vue";
import {Close} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";
import {getDateTimeISO8601, getNowDateTime, plusDateTimeAboutHour} from "@/utils/dateUtil";
import {addTestPaper} from "@/api/learn-api";
import {ElMessage} from "element-plus";
import {withLoading} from "@/utils/functionUtil";

const showDialog = ref(false)
const props = defineProps({
  showDialog: Boolean
})
watchEffect(() => {
  showDialog.value = props.showDialog
})
const emit = defineEmits(['close'])
const closeDialog = (des) => {
  showDialog.value = false
  examInfo.test_title = ""
  emit('close', des + '-' + Math.random())
}
const loading = ref(false)
const router = useRouter()


// 提交考试信息
const examInfo = reactive({
  test_title: '',
  teacher_id: sessionStorage.getItem('uid'),
  lesson_id: router.currentRoute.value.query.lessonId,
  start_datetime: String(plusDateTimeAboutHour(getNowDateTime(), 1)),
  end_datetime: String(plusDateTimeAboutHour(getNowDateTime(), 2))
})
const submit = withLoading(async () => {
  examInfo.start_datetime = getDateTimeISO8601(new Date(examInfo.start_datetime))
  examInfo.end_datetime = getDateTimeISO8601(new Date(examInfo.end_datetime))
  const res = await addTestPaper(examInfo)
  if (res.code === 2002){
    ElMessage.success('已成功新建试卷')
    closeDialog('add')
  }
}, loading)
</script>

<template>
  <el-dialog v-model="showDialog"
             v-if="showDialog"
             style="border-radius: 15px"
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
            <el-button @click="closeDialog('cancel')" :disabled="loading" :icon="Close" style="border: none" circle/>
          </el-col>
          <el-col :xs="17" :sm="17" :md="17" :lg="17" :xl="17">
            <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;填写考试基本信息</h3>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right;">
            <el-button @click="submit" type="primary" color="#333" :loading="loading" round>确认填写</el-button>
          </el-col>
        </el-row>
      </div>
    </template>
    <el-card shadow="never" style="border-radius: 10px;margin-top: -15px;">
      <el-form :model="examInfo" label-position="top">
        <el-form-item label="试卷标题">
          <el-input v-model="examInfo.test_title"
                    maxlength="15"
                    type="textarea" rows="1" placeholder="请输入试卷标题" show-word-limit/>
        </el-form-item>
        <el-form-item label="考试开始时间">
          <el-date-picker
              v-model="examInfo.start_datetime"
              type="datetime"
              placeholder="选择开始时间"
              format="YYYY/MM/DD HH:mm:ss"
              :clearable="false"
          />
        </el-form-item>
        <el-form-item label="考试结束时间">
          <el-date-picker
              v-model="examInfo.end_datetime"
              type="datetime"
              placeholder="选择结束时间"
              format="YYYY/MM/DD HH:mm:ss"
              :clearable="false"
          />
        </el-form-item>
      </el-form>
    </el-card>

  </el-dialog>
</template>

<style scoped>

</style>