<script setup>
import {ref, defineProps, watchEffect, defineEmits, reactive} from "vue";
import {deepCompareObject, objectsIsNull} from "@/utils/dataUtil";
import {getLessonDetail, updateLessonByTeacher} from "@/api/plan-api";
import {withLoading} from "@/utils/functionUtil";
import {ElMessage} from "element-plus";
import {Close} from "@element-plus/icons-vue";


// 定义全局变量
const loading = ref(false)
const showUpdateLessonDialog = ref(false)
const props = defineProps({
  showUpdateLessonDialog: Boolean,
  lessonId: Number
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
             style="border-radius: 15px"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             title="编辑课程信息"
             :lock-scroll="false"
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
            <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;编辑课程详细</h3>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right;">
            <el-button type="primary" @click="updateLesson" round
                       :disabled="objectsIsNull(lessonObj) || loading
                   || deepCompareObject(originLessonDetail, lessonObj)"
                       color="#333333" > 确认编辑 </el-button>
          </el-col>
        </el-row>
      </div>
    </template>
    <el-card shadow="never" style="margin-top: -10px;border-radius: 10px">
      <el-form :model="lessonObj" v-loading="loading" label-position="top">
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
    </el-card>
  </el-dialog>
</template>

<style scoped>
</style>