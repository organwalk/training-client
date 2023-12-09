<script setup>
import {defineProps,  onBeforeUpdate, ref, watchEffect ,defineEmits} from "vue";
import {getStudentLearningChapters} from "@/api/progress-api";
import {getUserInfoByUid} from "@/api/user-api";
import {Search} from "@element-plus/icons-vue";


// 定义全局变量
const loading = ref(false)
const showStudentProgressListDialog = ref(false)
const props = defineProps({
  showStudentProgressListDialog : Boolean,
  lessonId : String
})
const emit = defineEmits(['closeStudentProgressListDialog'])
watchEffect(() => {
  showStudentProgressListDialog.value = props.showStudentProgressListDialog
})




//获取学员在指定课程下学习到的章节列表
const studentLearningChapters = ref()
const originStuLearnChapter = ref()
const getStudentChapters = async () => {
  loading.value = true
  const res = await getStudentLearningChapters(props.lessonId,999, 0)
  if (res.code === 5005){
    studentLearningChapters.value = []
  }else{
    studentLearningChapters.value = res.data
    const promises = studentLearningChapters.value.map(async (item) => {
      const res = await getUserInfoByUid(item.student_id);
      item.student_id = res.data.realName;
    });
    await Promise.all(promises);
    originStuLearnChapter.value = studentLearningChapters.value
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

const studentProgressByKeyword = async (keyword) => {
  if (keyword === ""){
    await getStudentChapters()
  }else {
    loading.value = true;
    studentLearningChapters.value = searchFunction(originStuLearnChapter.value, keyword)
    loading.value = false;
  }
}


onBeforeUpdate(() => {
  getStudentChapters()
})


function handleClose(done) {
  showStudentProgressListDialog.value = false
  done(); // 必须调用done()以关闭对话框
  emit('closeStudentProgressListDialog', false)
}




</script>


<template>
  <el-dialog v-model="showStudentProgressListDialog"
             v-if="showStudentProgressListDialog"
              title="学员完成进度时间线"
             width="30%"
             ref="dialog"
             :before-close="handleClose"
             >


    <el-input v-model="keyword"
              @input="studentProgressByKeyword"
              :prefix-icon="Search"
              placeholder="请输入学员名称"
              style="margin-bottom: 3vh"/>

    <el-timeline v-loading="loading">
      <el-timeline-item
          v-for="( activity , index ) in studentLearningChapters"
          :key = "index"
          :timestamp = "activity.completionDate"
      >
        {{activity.student_id}}
        {{activity.chapter.chapter_name}}
      </el-timeline-item>
    </el-timeline>

  </el-dialog>
</template>



<style scoped>

</style>