<script setup>
import {defineProps, onBeforeUpdate,  ref, watchEffect, defineEmits} from "vue";
import {getStudentLearningProgressByLessonId} from "@/api/progress-api";
import {getUserInfoByUid} from "@/api/user-api";
import {Search} from "@element-plus/icons-vue";


const loading = ref(false)
const showStudentRankingListDialog = ref(false)
const props = defineProps({
  showStudentRankingListDialog : Boolean,
  lessonId : String
})
const emit = defineEmits(['closeStudentRankingListDialog'])
watchEffect(() => {
  showStudentRankingListDialog.value = props.showStudentRankingListDialog
})


//获取学员在指定课程下学习进度百分比数据
const studentLearningProgressByLessonIds = ref()
const originStudentProgress = ref()
const getStudentByLessonId = async () => {
  loading.value = true
  const res = await getStudentLearningProgressByLessonId(props.lessonId,999, 0)
  if (res.code === 5005){
    studentLearningProgressByLessonIds.value = []
  }else{
    studentLearningProgressByLessonIds.value = res.data
    const promises = studentLearningProgressByLessonIds.value.map(async (item) => {
      const res = await getUserInfoByUid(item.student_id);
      item.student_id = res.data.realName;
    });
    await Promise.all(promises);
    originStudentProgress.value = studentLearningProgressByLessonIds.value
  }
  loading.value = false
}


const keyword = ref('')
function matchText(a, b) {
  const regex = new RegExp(a, 'i');
  return regex.test(b);
}

const searchFunction = (searchList , keyword) => {
  const result = ref([])
  searchList.find(item => {
    if(matchText(keyword, item.student_id)){
      result.value.push(item)
    }
  })
  return result.value
}


const studentRankingByKeyword = async (keyword) => {
  if (keyword === ""){
    await getStudentByLessonId()
  }else {
    loading.value = true;
    studentLearningProgressByLessonIds.value = searchFunction(originStudentProgress.value, keyword)
    loading.value = false;
  }
}



onBeforeUpdate(() => {
  getStudentByLessonId()
})

function handleClose(done) {
  showStudentRankingListDialog.value = false
  done(); // 必须调用done()以关闭对话框
  emit('closeStudentRankingListDialog', false)
}


</script>




<template>
  <el-dialog v-model="showStudentRankingListDialog"
             v-if="showStudentRankingListDialog"
             title="学员完成进度排行榜"
             width="30%"
             :before-close="handleClose"
  >
    <el-input v-model="keyword"
              @input="studentRankingByKeyword"
              :prefix-icon="Search"
              placeholder="请输入学员名称"
              style="margin-bottom: 3vh"/>

    <ol class="demo-progress" v-loading="loading">
      <el-progress v-for="(item, index) in studentLearningProgressByLessonIds"
                   :key="index"
                   :percentage=" item.present * 100  "
      >
        {{ item.student_id }}
      </el-progress>
    </ol>
  </el-dialog>
</template>





<style scoped>
.demo-progress .el-progress--line {
  margin-bottom: 15px;
  width: 350px;
}
</style>