<script setup>
import { getStudentLearningProgressByLessonId,} from '@/api/progress-api'
import {getUserInfoByUid} from "@/api/user-api";
import {defineProps, ref, watchEffect} from "vue";
import {withLoading} from "@/utils/functionUtil";


const loading = ref(false)
const props = defineProps({
  lessonId : Number
})

//获取学员在指定课程下学习进度百分比数据
const studentLearningProgressByLessonIds = ref()
const getStudentByLessonId = withLoading(async () => {
  const res = await getStudentLearningProgressByLessonId(props.lessonId,6, 0)
  if (res.code === 2002){
    studentLearningProgressByLessonIds.value = res.data
    const promises = studentLearningProgressByLessonIds.value.map(async (item) => {
      const res = await getUserInfoByUid(item.student_id);
      item.student_id = res.data.realName;
    });
    await Promise.all(promises);
  }
}, loading)

watchEffect(async () => {
  if (props.lessonId){
    await getStudentByLessonId()
  }
})

</script>



<template>
  <el-card style="height: 270px" shadow="never" v-loading="loading">
    <div v-for="(item, index) in studentLearningProgressByLessonIds" :key="index">
      <el-text size="small">{{ index + 1 }}.&nbsp;{{ item.student_id }}&nbsp;&nbsp;{{item['present'] * 100}}%</el-text>
      <el-progress style="margin-bottom: 10px;"
                   :percentage=" item['present'] * 100" :show-text="false">
      </el-progress>
    </div>
  </el-card>
</template>


<style scoped>
</style>