<script setup>
import {getStudentLearningChapters} from '@/api/progress-api'
import {getUserInfoByUid} from "@/api/user-api";
import {defineProps, ref, watchEffect} from "vue";
import {withLoading} from "@/utils/functionUtil";
import {Right} from "@element-plus/icons-vue";

const loading = ref(false)
const showStudentProgressListDialog = ref(false)
const props = defineProps({
  showStudentProgressListDialog : Boolean,
  lessonId : Number
})

watchEffect(() => {
  showStudentProgressListDialog.value = props.showStudentProgressListDialog
})

//获取学员在指定课程下学习到的章节列表
const studentLearningChapters = ref([])
const getStudentChapters = withLoading(async () => {
  const res = await getStudentLearningChapters(props.lessonId,6, 0)
  if (res.code === 2002){
    studentLearningChapters.value = res.data
    const promises = studentLearningChapters.value.map(async (item) => {
      const res = await getUserInfoByUid(item.student_id);
      item.student_id = res.data.realName;
    });
    await Promise.all(promises);
  }
}, loading)

watchEffect(async () => {
  if (props.lessonId){
    await getStudentChapters()
  }
})


</script>

<template>
  <el-card style="height: 380px" shadow="never" v-loading="loading">
    <el-timeline style="padding-left: 0">
      <el-timeline-item
          v-for="( activity , index ) in studentLearningChapters"
          :key = "index"
          :timestamp = "activity['completionDate']"
      >
        <el-text>{{ activity.student_id  }}<el-icon><Right /></el-icon><el-text type="primary">{{activity['chapter'].chapter_name}}</el-text></el-text>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<style scoped>

</style>