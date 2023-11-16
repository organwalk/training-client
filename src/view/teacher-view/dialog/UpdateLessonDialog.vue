<script setup>
import {ref, defineProps, watchEffect, defineEmits, reactive} from "vue";
import {deepCompareObject, objectsIsNull} from "@/utils/dataUtil";
import {getLessonDetail, updateLessonByTeacher} from "@/api/plan-api";
import {withLoading} from "@/utils/functionUtil";
import {ElMessage} from "element-plus";


// 定义全局变量
const loading = ref(false)
const showUpdateLessonDialog = ref(false)
const props = defineProps({
  showUpdateLessonDialog: Boolean,
  lessonId: String
})
const emit = defineEmits(['closeUpdateLessonDialog'])
watchEffect(() => {
  showUpdateLessonDialog.value = props.showUpdateLessonDialog
})


// 关闭对话框时
const closeDialog = (des) => {
  showUpdateLessonDialog.value = false
  emit('closeUpdateLessonDialog',des + '-' + Math.random())
}


// 定义表单及添加事件
const lessonObj = reactive({
  lesson_name: "",
  lesson_des: "",
})
const updateLesson = withLoading(async () => {
  const res = await updateLessonByTeacher(sessionStorage.getItem("uid"), props.lessonId, lessonObj)
  if (res.code === 2002) {
    ElMessage.success(res.msg)
    closeDialog('edit')
  }
}, loading)


// 获取课程详情
let originLessonDetail
const loadingLessonDetail = withLoading(async () => {
  const res = await getLessonDetail(props.lessonId)
  if (res.code === 2002) {
    const {lesson_name, lesson_des} = res.data
    lessonObj.lesson_name = lesson_name
    lessonObj.lesson_des = lesson_des

    // 保存原始课程细节，供比较使用
    originLessonDetail = {
      lesson_name: lesson_name,
      lesson_des: lesson_des
    }
  }
}, loading)


</script>

<template>
  <el-dialog v-model="showUpdateLessonDialog"
             v-if="showUpdateLessonDialog"
             @opened="loadingLessonDetail()"
             width="45%"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             title="编辑课程信息"
             :lock-scroll="false"
  >
    <el-form :model="lessonObj" v-loading="loading">
      <el-form-item label="课程名称">
        <el-input v-model="lessonObj.lesson_name" maxlength="15" show-word-limit type="textarea" rows="1"/>
      </el-form-item>
      <el-form-item label="课程描述">
        <el-input type="textarea" v-model="lessonObj.lesson_des"
                  rows="5"
                  maxlength="150"
                  show-word-limit/>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog('cancel')" :disabled="loading">取消</el-button>
        <el-button type="primary" @click="updateLesson"
                   :disabled="objectsIsNull(lessonObj) || loading
                   || deepCompareObject(originLessonDetail, lessonObj)"
                   color="#333333">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
</style>