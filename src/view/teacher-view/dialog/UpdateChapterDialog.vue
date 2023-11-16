<script setup>
import {ref, defineProps, watchEffect, defineEmits, reactive} from "vue";

// 定义全局变量
const loading = ref(false)
const props = defineProps({
  showUpdateChapterDialog: Boolean,
  chapterName: String
})
const emit = defineEmits(['closeUpdateChapterDialog'])
const showUpdateChapterDialog = ref(false)
watchEffect(() => {
  console.log(props.showUpdateChapterDialog)
  showUpdateChapterDialog.value = props.showUpdateChapterDialog
})


// 定义表单信息
const chapterObj = reactive({
  chapter_name: '······'
})
const radioVal = ref('Markdown文档')
const showChoose = ref(true)
const markdownText = ref('')


// 关闭对话框
const closeDialog = (des) => {
  chapterObj.chapter_name = '······'
  showUpdateChapterDialog.value = false
  emit('closeUpdateChapterDialog', des + '-' + Math.random())
}


// 打开对话框时
const whenOpen = () => {
  chapterObj.chapter_name = props.chapterName
}
const saveMarkdown = (text, html) => {
  console.log(text)
  console.log(html)
}
</script>

<template>
  <el-dialog v-model="showUpdateChapterDialog"
             v-if="showUpdateChapterDialog"
             @opened="whenOpen"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             :lock-scroll="false"
             fullscreen
             id="update-chapter"
  >
    <el-row>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="center">
        <el-card shadow="never" style="width: 50%;" v-show="showChoose">
          <el-row>
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="left">
              <h3>编辑章节信息</h3>
              <el-form :model="chapterObj">
                <el-form-item label="课程章节标题">
                  <el-input v-model="chapterObj.chapter_name" maxlength="15" show-word-limit type="textarea" rows="1"/>
                </el-form-item>
                <el-form-item label="课程教材类型">
                  <el-radio-group v-model="radioVal">
                    <el-radio-button label="Markdown文档"/>
                    <el-radio-button label="讲解视频录像"/>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="上传教材状态">
                  <el-tag type="danger">暂未上传教材</el-tag>
                </el-form-item>
              </el-form>
            </el-col>
          </el-row>
          <el-divider/>
          <el-button @click="closeDialog('cancel')" :disabled="loading">取消</el-button>
          <el-button type="primary"
                     @click="showChoose = !showChoose"
                     color="#333333">
            下一步
          </el-button>
        </el-card>
        <div v-show="!showChoose">
          <el-row style="margin-top: -50px;">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="left">
              <el-button @click="showChoose = !showChoose" :disabled="loading">返回</el-button>
            </el-col>
          </el-row><br/>
          <el-row>
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="left">
              <v-md-editor v-model="markdownText"
                           height="85vh"
                           :autofocus="true"
                           @save="saveMarkdown"
                           placeholder="请在此处编写课程教材文档"
                           :default-show-toc="true"
              ></v-md-editor>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<style scoped>
:global(#update-chapter) {
  background-color: #f1f2f3;
  margin-top: 0;
  padding: 0;
}
</style>