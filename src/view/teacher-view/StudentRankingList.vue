<script setup>
import { getStudentLearningProgressByLessonId,} from '@/api/progress-api'
import {getUserInfoByUid} from "@/api/user-api";
import { defineProps, onBeforeUpdate, ref} from "vue";


const loading = ref(false)
const props = defineProps({
  lessonId : String
})

//获取学员在指定课程下学习进度百分比数据
const studentLearningProgressByLessonIds = ref()
const getStudentByLessonId = async () => {
  loading.value = true
  const res = await getStudentLearningProgressByLessonId(props.lessonId,6, 0)
  if (res.code === 5005){
    studentLearningProgressByLessonIds.value = []
  }else{
    studentLearningProgressByLessonIds.value = res.data
    const promises = studentLearningProgressByLessonIds.value.map(async (item) => {
      const res = await getUserInfoByUid(item.student_id);
      item.student_id = res.data.realName;
    });
    await Promise.all(promises);
  }
  loading.value = false
}


onBeforeUpdate(() => {
  getStudentByLessonId()
})

</script>



<template>
  <el-card shadow="never">
    <ol class="demo-progress"  v-loading="loading">
      <el-progress v-for="(item, index) in studentLearningProgressByLessonIds"
                   :key="index"
                   :percentage=" item.present * 100  "
                   >
        {{ item.student_id }}
      </el-progress>
    </ol>
  </el-card>
</template>


<style scoped>
.demo-progress .el-progress--line {
  margin-bottom: 15px;
  width: 350px;
}
</style>