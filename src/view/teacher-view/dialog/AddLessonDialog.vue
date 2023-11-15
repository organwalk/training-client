<script setup>
import {ref, defineProps, watchEffect, defineEmits, reactive} from "vue";
import {objectsIsNull} from "@/utils/dataUtil";
import {addLessonByTeacher} from "@/api/plan-api";
import {withLoading} from "@/utils/functionUtil";
import {ElMessage} from "element-plus";


// 定义全局变量
const loading = ref(false)
const showAddLessonDialog = ref(false)
const props = defineProps({
  showAddLessonDialog:Boolean,
  planId:String
})
const emit = defineEmits(['closeAddLessonDialog'])
watchEffect(() => {
  showAddLessonDialog.value = props.showAddLessonDialog
})



// 定义表单及添加事件
const lessonObj = reactive({
  lesson_name:"",
  lesson_des:"",
  teacher_id:sessionStorage.getItem("uid")
})
const addLesson = withLoading(async () => {
  const res = await addLessonByTeacher(props.planId, lessonObj)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    closeDialog()
  }
}, loading)



// 关闭对话框时
const closeDialog = () => {
  showAddLessonDialog.value = false
  emit('closeAddLessonDialog', false)
}
</script>

<template>
  <el-dialog v-model="showAddLessonDialog"
             v-if="showAddLessonDialog"
             width="45%"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :before-close="closeDialog"
             :show-close="false"
             id="add-lesson"
             title="添加新课程"
  >
    <el-form :model="lessonObj" v-loading="loading">
      <el-form-item label="课程名称">
        <el-input v-model="lessonObj.lesson_name" maxlength="15" show-word-limit/>
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
        <el-button @click="closeDialog" :disabled="loading">取消</el-button>
        <el-button type="primary" @click="addLesson" :disabled="objectsIsNull(lessonObj) || loading" color="#333333">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>