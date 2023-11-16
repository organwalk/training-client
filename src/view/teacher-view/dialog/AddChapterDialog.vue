<script setup>
import {ref, defineProps, watchEffect, defineEmits, reactive} from "vue";
import {objectsIsNull} from "@/utils/dataUtil";
import {addChapterByLesson} from "@/api/plan-api";
import {withLoading} from "@/utils/functionUtil";
import {ElMessage} from "element-plus";


// 定义全局变量
const loading = ref(false)
const showAddChapterDialog = ref(false)
const props = defineProps({
  showAddChapterDialog:Boolean,
  lessonId:String
})
const emit = defineEmits(['closeAddChapterDialog'])
watchEffect(() => {
  showAddChapterDialog.value = props.showAddChapterDialog
})



// 定义表单及添加事件
const chapterObj = reactive({
  chapter_name:""
})
const addChapter = withLoading(async () => {
  const res = await addChapterByLesson(props.lessonId, chapterObj)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    closeDialog('add')
  }
}, loading)



// 关闭对话框时
const closeDialog = (des) => {
  chapterObj.chapter_name = ""
  showAddChapterDialog.value = false
  emit('closeAddChapterDialog', des + '-' + Math.random())
}
</script>

<template>
  <el-dialog v-model="showAddChapterDialog"
             v-if="showAddChapterDialog"
             width="45%"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             title="添加新章节"
             :lock-scroll="false"
  >
    <el-form :model="chapterObj" v-loading="loading">
      <el-form-item label="章节名称">
        <el-input v-model="chapterObj.chapter_name" maxlength="15" show-word-limit type="textarea" rows="1"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog('cancel')" :disabled="loading">取消</el-button>
        <el-button type="primary" @click="addChapter" :disabled="objectsIsNull(chapterObj) || loading" color="#333333">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>