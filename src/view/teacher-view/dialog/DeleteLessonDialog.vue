<script setup>
import {ref, defineProps, defineEmits, watchEffect} from "vue";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {withLoading} from "@/utils/functionUtil";
import {deleteLessonByLessonId} from "@/api/plan-api";
import {ElMessage} from "element-plus";
import {Close} from "@element-plus/icons-vue";


// 定义全局变量
const loading = ref(false)
const props = defineProps({
  showDeleteLessonDialog:Boolean,
  lessonId:Number,
  lessonName:String
})
const emit = defineEmits(['closeDeleteLessonDialog'])
const showDeleteLessonDialog = ref(false)
watchEffect(() => {
  showDeleteLessonDialog.value = props.showDeleteLessonDialog
})


// 初始化
const checkStr = ref()
const loadingData = () => {
  checkStr.value = sessionStorage.getItem("username") + '/' + props.lessonName
}


// 删除
const inputCheckStr = ref('')
const deleteLesson = withLoading(async () => {
  const res = await deleteLessonByLessonId(props.lessonId)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    closeDialog("delete")
  }
}, loading)

// 关闭对话框
const closeDialog = (des) => {
  showDeleteLessonDialog.value = false
  emit('closeDeleteLessonDialog',des + '-' + Math.random())
}
</script>

<template>
  <el-dialog v-model="showDeleteLessonDialog"
             v-if="showDeleteLessonDialog"
             @opened="loadingData"
             width="45%"
             style="border-radius: 15px"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
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
            <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;删除</h3>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right;">
            <el-button type="primary" @click="deleteLesson"
                       :disabled="checkStr !== inputCheckStr" round
                       color="#333333">
              确认删除
            </el-button>
          </el-col>
        </el-row>
      </div>
    </template>
    <el-card shadow="never" style="text-align: center;user-select: none;margin-top: -10px;border-radius: 10px" v-loading="loading">
      <h1>删除此课程 ？</h1>
      <tc-container-full-row>
        <el-text>该操作意味着删除与该课程有关的一切章节、课程资源、成员关系、考核评估和进度跟踪数据。如果您清楚当前行为可能造成的后果，请输入下列内容确认删除此课程：<br/><h4>{{ checkStr }}</h4></el-text>
      </tc-container-full-row>
      <br/>
      <tc-container-full-row>
        <el-input v-model="inputCheckStr" placeholder="请在此输入确认内容" type="textarea" rows="1"/>
      </tc-container-full-row>
    </el-card>
  </el-dialog>
</template>

<style scoped>
</style>