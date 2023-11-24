<script setup>
import {ref, defineProps, watchEffect, defineEmits, reactive} from "vue";
import {objectsIsNull} from "@/utils/dataUtil";
import {addLessonByTeacher} from "@/api/plan-api";
import {withLoading} from "@/utils/functionUtil";
import {ElMessage} from "element-plus";
import {Close} from "@element-plus/icons-vue";


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
    closeDialog('add')
  }
}, loading)



// 关闭对话框时
const closeDialog = (des) => {
  lessonObj.lesson_name = ""
  lessonObj.lesson_des = ""
  showAddLessonDialog.value = false
  emit('closeAddLessonDialog', des + '-' + Math.random())
}
</script>

<template>
  <el-dialog v-model="showAddLessonDialog"
             v-if="showAddLessonDialog"
             width="45%"
             style="border-radius: 15px"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             id="add-lesson"
  >
    <template #header>
      <div class="card-header">
        <el-row style="display: flex; align-items: center;">
          <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1">
            <el-button @click="closeDialog('cancel')"
                       style="border: none"
                       :disabled="loading" :icon="Close" circle/>
          </el-col>
          <el-col :xs="17" :sm="17" :md="17" :lg="17" :xl="17">
            <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;添加新课程</h3>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right;">
            <el-button type="primary" @click="addLesson" round
                       :disabled="objectsIsNull(lessonObj) || loading" color="#333333">
              确认添加
            </el-button>
          </el-col>
        </el-row>
      </div>
    </template>
    <el-card shadow="never" style="margin-top: -10px;border-radius: 10px">
      <el-form :model="lessonObj" v-loading="loading" label-position="top">
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
    </el-card>
  </el-dialog>
</template>

<style scoped>

</style>