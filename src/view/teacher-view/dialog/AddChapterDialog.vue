<script setup>
import {ref, defineProps, watchEffect, defineEmits, reactive} from "vue";
import {objectsIsNull} from "@/utils/dataUtil";
import {addChapterByLesson} from "@/api/plan-api";
import {withLoading} from "@/utils/functionUtil";
import {ElMessage} from "element-plus";
import {Close} from "@element-plus/icons-vue";


// 定义全局变量
const loading = ref(false)
const showAddChapterDialog = ref(false)
const props = defineProps({
  showAddChapterDialog: Boolean,
  lessonId: Number
})
const emit = defineEmits(['closeAddChapterDialog'])
watchEffect(() => {
  showAddChapterDialog.value = props.showAddChapterDialog
})


// 定义表单及添加事件
const chapterObj = reactive({
  chapter_name: ""
})
const addChapter = withLoading(async () => {
  const res = await addChapterByLesson(props.lessonId, chapterObj)
  if (res.code === 2002) {
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
             style="border-radius: 15px"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             title="添加新章节"
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
            <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;增加新章节</h3>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right;">
            <el-button type="primary" @click="addChapter" round
                       :disabled="objectsIsNull(chapterObj) || loading" color="#333333">
              确认增加
            </el-button>
          </el-col>
        </el-row>
      </div>
    </template>
    <el-card shadow="never" style="margin-top: -10px;border-radius: 10px">
      <el-form :model="chapterObj" v-loading="loading" label-position="top">
        <el-form-item label="章节名称">
          <el-input v-model="chapterObj.chapter_name" maxlength="15" show-word-limit type="textarea" rows="1"/>
        </el-form-item>
      </el-form>
    </el-card>
  </el-dialog>
</template>

<style scoped>

</style>