<script setup>
import {defineProps, ref, watchEffect, defineEmits} from "vue";
import {getStudentLearningChapters} from "@/api/progress-api";
import {getUserInfoByUid} from "@/api/user-api";
import {Right, Search} from "@element-plus/icons-vue";


// 定义全局变量
const loading = ref(false)
const showStudentProgressListDialog = ref(false)
const props = defineProps({
  showStudentProgressListDialog: Boolean,
  lessonId: Number
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
  const res = await getStudentLearningChapters(props.lessonId, 999, 0)
  if (res.code === 5005) {
    studentLearningChapters.value = []
  } else {
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

const searchFunction = (searchList, keyword) => {
  const result = ref([])
  searchList.find(item => {
    if (matchText(keyword, item.student_id)) {
      result.value.push(item)
    }
  })
  return result.value
}

const studentProgressByKeyword = async (keyword) => {
  if (keyword === "") {
    await getStudentChapters()
  } else {
    loading.value = true;
    studentLearningChapters.value = searchFunction(originStuLearnChapter.value, keyword)
    loading.value = false;
  }
}

watchEffect(async () => {
  if (showStudentProgressListDialog.value && props.lessonId) {
    await getStudentChapters()
  }
})


function handleClose(done) {
  showStudentProgressListDialog.value = false
  done(); // 必须调用done()以关闭对话框
  emit('closeStudentProgressListDialog', false)
}


</script>


<template>
  <el-dialog title="学员完成进度时间线" width="50%" ref="dialog" top="0"
             style="margin-top: 10px"
             v-model="showStudentProgressListDialog"
             v-if="showStudentProgressListDialog"
             :before-close="handleClose" :lock-scroll="true"
  >
    <el-input v-model="keyword"
              @input="studentProgressByKeyword"
              :prefix-icon="Search"
              placeholder="请输入学员名称"
              style="margin-bottom: 3vh"/>
    <el-card style="height: 380px" shadow="never" v-loading="loading">
      <el-timeline style="padding-left: 0">
        <el-timeline-item
            v-for="( activity , index ) in studentLearningChapters"
            :key="index"
            :timestamp="activity['completionDate']"
        >
          <el-text>{{ activity.student_id }}
            <el-icon>
              <Right/>
            </el-icon>
            <el-text type="primary">{{ activity['chapter'].chapter_name }}</el-text>
          </el-text>
        </el-timeline-item>
      </el-timeline>
    </el-card>


  </el-dialog>
</template>


<style scoped>

</style>