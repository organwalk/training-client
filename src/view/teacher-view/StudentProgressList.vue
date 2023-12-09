<script setup>
import {getStudentLearningChapters} from '@/api/progress-api'
import {getUserInfoByUid} from "@/api/user-api";
import {defineProps, onBeforeUpdate, ref, watchEffect} from "vue";

const loading = ref(false)
const showStudentProgressListDialog = ref(false)
const props = defineProps({
  showStudentProgressListDialog : Boolean,
  lessonId : String
})

watchEffect(() => {
  showStudentProgressListDialog.value = props.showStudentProgressListDialog
})

//获取学员在指定课程下学习到的章节列表
const studentLearningChapters = ref()
const getStudentChapters = async () => {
  loading.value = true
  const res = await getStudentLearningChapters(props.lessonId,6, 0)
  if (res.code === 5005){
    studentLearningChapters.value = []
  }else{
    studentLearningChapters.value = res.data
    const promises = studentLearningChapters.value.map(async (item) => {
      const res = await getUserInfoByUid(item.student_id);
      item.student_id = res.data.realName;
    });
    await Promise.all(promises);
  }
  loading.value = false
}


onBeforeUpdate(() => {
  getStudentChapters()
})


</script>

<template>
  <el-card shadow="never">
    <el-timeline  v-loading="loading">
      <el-timeline-item
          v-for="( activity , index ) in studentLearningChapters"
          :key = "index"
          :timestamp = "activity.completionDate"
      >
        {{ activity.student_id  }}
        {{activity.chapter.chapter_name}}
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<style scoped>

</style>