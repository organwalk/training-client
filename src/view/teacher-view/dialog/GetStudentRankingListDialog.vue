<script setup>
import {defineProps, ref, watchEffect, defineEmits} from "vue";
import {getStudentLearningProgressByLessonId} from "@/api/progress-api";
import {getUserInfoByUid} from "@/api/user-api";
import {withLoading} from "@/utils/functionUtil";


const loading = ref(false)
const showStudentRankingListDialog = ref(false)
const props = defineProps({
  showStudentRankingListDialog: Boolean,
  lessonId: Number
})
const emit = defineEmits(['closeStudentRankingListDialog'])
watchEffect(() => {
  showStudentRankingListDialog.value = props.showStudentRankingListDialog
})


//获取学员在指定课程下学习进度百分比数据
const studentLearningProgressByLessonIds = ref()
const originStudentProgress = ref()
const getStudentByLessonId = withLoading(async () => {
  const res = await getStudentLearningProgressByLessonId(props.lessonId, 999999, 0)
  if (res.code === 2002) {
    studentLearningProgressByLessonIds.value = res.data
    const promises = studentLearningProgressByLessonIds.value.map(async (item) => {
      const res = await getUserInfoByUid(item.student_id);
      item.student_id = res.data.realName;
    });
    await Promise.all(promises);
    originStudentProgress.value = studentLearningProgressByLessonIds.value
  }
}, loading)


watchEffect(async () => {
  if (props.lessonId){
    await getStudentByLessonId()
  }
})

function handleClose(done) {
  showStudentRankingListDialog.value = false
  done(); // 必须调用done()以关闭对话框
  emit('closeStudentRankingListDialog', false)
}


</script>


<template>
  <el-dialog style="border-radius: 15px;margin-top: 10px" width="50%" top="0"
             v-model="showStudentRankingListDialog"
             v-if="showStudentRankingListDialog"
             :before-close="handleClose" :lock-scroll="true"
  >
    <template #header>
      <div class="card-header">
        <el-row style="display: flex; align-items: center;">
          <h3 style="margin-top: 0;margin-bottom: 0">学员进度排行</h3>
        </el-row>
      </div>
    </template>
    <el-card style="margin-top: -10px;height: 75vh;overflow-y: auto" shadow="never" v-loading="loading">
      <div v-for="(item, index) in studentLearningProgressByLessonIds" :key="index">
        <el-text>{{ index + 1 }}.&nbsp;{{ item.student_id }}&nbsp;&nbsp;{{ item['present'] * 100 }}%</el-text>
        <el-progress style="margin-bottom: 10px;margin-top: 5px"
                     :percentage=" item['present'] * 100" :show-text="false">
        </el-progress>
        <br/>
      </div>
    </el-card>
  </el-dialog>
</template>


<style scoped>
.demo-progress .el-progress--line {
  margin-bottom: 15px;
  width: 350px;
}
</style>