<script setup>
import {onMounted, reactive, ref, watch} from "vue";
import {useRouter} from "vue-router";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {calculateHash, generateRandomHash} from "@/utils/dataUtil";
import {
  deleteResourceLesson,
  fileSliceSize,
  getResourceLesson, getResourceLessonId,
  reUploadLessonResource,
  uploadLessonResource
} from "@/api/resource-api";
import {withLoading} from "@/utils/functionUtil";
import {ElMessage} from "element-plus";
import {UploadFilled, Document, Delete, ArrowLeft} from "@element-plus/icons-vue";
import "vue3-video-play/dist/style.css";

// 定义全局变量
const preLoading = ref(false)
const loading = ref(false)
const router = useRouter()
const lessonId = router.currentRoute.value.query.lesson_id
const chapterId = router.currentRoute.value.query.chapter_id
const chapterName = router.currentRoute.value.query.chapter_name
const resourceId = router.currentRoute.value.query.resource_id
const chapterObj = reactive({
  chapter_name: chapterName
})
const radioVal = ref('Markdown文档')
const showChoose = ref(true)


// 此部分定义获取教材状态并进行资源预加载、radio反例禁用逻辑
const tagType = ref("danger")
const tagTextMap = {
  "danger":"未上传",
  "success":"已上传"
}
const nonMarkdown = ref(false)
const nonVideo = ref(false)

// 设置教材状态
const setResourceLessonState = async () => {
  // 如果存在资源ID，说明该教材资源存在
  if (resourceId){
    // 将状态标签设置为success
    tagType.value = "success"
    // 预加载教材资源
    await preLoadingResourceLesson()
  }
}

// 根据教材类型禁用反例选项
const disableResourceTypeRadio = (contentType) => {
  if (contentType.includes('markdown')){
    nonVideo.value = true
    return 'markdown'
  }else if (contentType.includes('video')){
    nonVideo.value = false
    radioVal.value = '讲解视频录像'
    return 'video'
  }
}

// 预加载教材文档
const preLoadingResourceLesson = async () => {
  preLoading.value = true
  const res = await getResourceLesson(resourceId)
  if (res.status === 200 || res.status === 206){
    // 加载成功时，根据教材类型禁用反例选项
    const type = disableResourceTypeRadio(res.headers.get('content-type'))
    // 若为markdown类型，则载入编辑器内容中
    if (type === 'markdown'){
      markdownText.value = String(res.data)
    }else if (type === 'video'){
      showUploadVideo.value = false
      await loadingVideo(resourceId)
    }
  }
  preLoading.value = false
}




// Markdown编辑器相关
const markdownText = ref('')
const saveMarkdown = async (text) => {
  const markdownFile = new Blob([text], {type: 'text/markdown'});
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(markdownFile);
  downloadLink.download = chapterName + '.md';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}


// 此部分定义提交教程文件逻辑，包括上传和重传机制的抉择
const nonReUpload = ref(true)  // 是否重传
const nonChangeMarkdown = ref(true)
// 为文档时，可以通过比较文档内容与预载入内容是否一致判断重传
watch(markdownText, (newVal, oldVal) => {
  if (newVal !== oldVal && oldVal !== ''){
    nonChangeMarkdown.value = false
  }
})
if (resourceId){
  nonReUpload.value = false
}

// 提交教材
const getFileTotalSlice = (size) => {
  return Math.ceil(size / fileSliceSize)
}
const submitFile = withLoading(async () => {
  let file
  if (localFile.value){
    file = localFile.value.raw
  }else {
    file = new Blob([markdownText.value], {type: 'text/markdown'});
  }
  const hash = await calculateHash(file)
  const size = file.size
  const totalSlice = getFileTotalSlice(size)
  const fileName = await generateRandomHash() + '.md'

  await uploadResource(file, hash, size, totalSlice, fileName)

}, loading)

// 计算切片
const calculationChunk = (index, totalSlice, file, size) => {
  if (index === totalSlice) {
    // 最后一片
    return file.slice((index - 1) * fileSliceSize, size);
  } else {
    return file.slice((index - 1) * fileSliceSize, index * fileSliceSize);
  }
}

// 设置课程资源对象
const setResourceLessonObj = (chunk, hash, size, totalSlice, index, fileName) => {
  return {
    lesson_id: lessonId,
    teacher_id: sessionStorage.getItem('uid'),
    chapter_id: chapterId,
    resource_file: chunk,
    file_hash: hash,
    file_size: size,
    file_chunks_sum: totalSlice,
    file_now_chunk: index,
    file_origin_name: fileName
  }
}

// 上传资源
const uploadProgress = ref(0)
const uploadColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#1989fa', percentage: 60 },
  { color: '#6f7ad3', percentage: 80 },
  { color: '#5cb87a', percentage: 100 },
]
const uploadResource = async (file, hash, size, totalSlice, fileName) => {
  for (let i = 1; i <= totalSlice; i++) {
    let chunk = calculationChunk(i, totalSlice, file, size)
    let obj = setResourceLessonObj(chunk, hash, size, totalSlice, i, fileName)
    let res
    if (nonReUpload.value){
      res = await uploadLessonResource(obj)
    }else {
      res = await reUploadLessonResource(obj)
    }
    if (res.msg === "当前文件片段上传成功" && showProgress){
      uploadProgress.value = Math.floor((i / totalSlice) * 100);
    } else if (res.msg.includes("教材上传成功") || res.msg.includes("教材资源上传成功")){
      ElMessage.success(res.msg + "，章节：" + chapterName)
      window.location.href = '/teacher'
      // 如果此时展示了视频上传组件
      if (showUploadVideo.value){
        // 关闭组件，并请求视频ID，同时进行视频加载
        showUploadVideo.value = false
        loading.value = true
        const idRes = await getResourceLessonId(lessonId, chapterId)
        loading.value = false
        await loadingVideo(idRes.data)
      }else {
        setTimeout(() => {
          window.location.href = '/teacher'
        }, 1000)
      }
      break
    }
  }
}


// 上传本地文档
const showUploadMarkdownDialog = ref(false)
const localFile = ref('')

// 改变文件时
const handChange = (file, fileList) => {
  localFile.value = file
  if (fileList.length > 1) {
    fileList.splice(0, 1);
  }else if (!showUploadVideo.value && !file.name.includes('.md')){
    ElMessage.warning("仅支持上传markdown文档")
    fileList.splice(0, 1);
  }
}

// 文件移除时
const handRemove = () => {
  localFile.value = ''
}

// 提交文件
const isSubmit = ref(false)
const showProgress = ref(false)
const showUploadVideo = ref(true)
const uploadLocalFile = async (type) => {
  if (type === 'video') showProgress.value = true
  isSubmit.value = true
  await submitFile()
  isSubmit.value = false
  if (type === 'markdown') showUploadMarkdownDialog.value = false
}


// 删除已上传的教材资源
const deleteFile = withLoading(async () => {
  const res = await deleteResourceLesson(sessionStorage.getItem('uid'), lessonId, chapterId)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    window.location.href = '/teacher/edit?lesson_id=' + lessonId + '&chapter_id=' + chapterId + '&chapter_name=' + chapterName
  }
}, loading)


// 播放视频
const videoUrl = ref('')
const loadingVideo = () => {
  videoUrl.value = "http://localhost:8183/api/resource/v2/lesson/" + resourceId
  // videoUrl.value = "http://localhost/video"
}
const playOptions = reactive({
  width: "800px", //播放器宽度
  height: "450px", //播放器高度
  color: "#409eff", //主题色
  title: "", //视频名称
  src: "http://localhost/test", //视频源
  muted: false, //静音
  webFullScreen: false,
  speedRate: ["0.75", "1.0", "1.25", "1.5", "2.0"], //播放倍速
  autoPlay: false, //自动播放
  loop: false, //循环播放
  mirror: false, //镜像画面
  ligthOff: false, //关灯模式
  volume: 0.3, //默认音量大小
  control: true, //是否显示控制
  controlBtns: [
    "audioTrack",
    "quality",
    "speedRate",
    "volume",
    "setting",
    "pip",
    "pageFullScreen",
    "fullScreen",
  ], //显示所有按钮,
});

// 生命周期钩子
onMounted(async () => {
  await setResourceLessonState()
})
</script>

<template>
  <el-row>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="center">
      <!-- 上传教材类型选择 -->
      <el-card shadow="never" style="width: 50%;margin-top: 20px" v-show="showChoose" v-loading="preLoading">
        <el-row>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="left">
            <h3>|&nbsp;&nbsp;&nbsp;编辑章节信息</h3><br/>
            <el-form :model="chapterObj">
              <el-form-item label="课程章节标题">
                <el-input v-model="chapterObj.chapter_name" maxlength="15" show-word-limit type="textarea" rows="1"/>
              </el-form-item>
              <el-form-item label="课程教材类型">
                <el-radio-group v-model="radioVal" fill="#333333">
                  <el-radio-button label="Markdown文档" :disabled="nonMarkdown"/>
                  <el-radio-button label="讲解视频录像" :disabled="nonVideo"/>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="教材上传状态">
                <el-tag :type="tagType">{{ tagTextMap[tagType] }}</el-tag>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <el-divider/>
        <el-button @click="router.push('/teacher')" :disabled="loading">取消</el-button>
        <el-button type="primary"
                   @click="showChoose = !showChoose"
                   color="#333333">
          下一步
        </el-button>
      </el-card>

      <!-- 编辑markdown文档 -->
      <div v-show="!showChoose && radioVal === 'Markdown文档'">
        <el-row>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="left">
            <el-card shadow="never" style="border-top: none;overflow-y: auto"  v-loading="loading">
              <template #header>
                <tc-container-full-row>
                  <el-row>
                    <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" align="left">
                      <h3 style="margin-top: 0;margin-bottom: 0;user-select: none">|&nbsp;&nbsp;{{ chapterName }}</h3>
                    </el-col>
                    <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18" align="right">
                      <el-button @click="showChoose = !showChoose"
                                 style="width: 20px"
                                 :disabled="loading" :icon="ArrowLeft" />
                      <el-button @click="deleteFile"
                                 :icon="Delete" :disabled="loading || !resourceId">删除</el-button>
                      <el-button @click="showUploadMarkdownDialog = true"
                                 :icon="Document">本地上传</el-button>
                      <el-button @click="submitFile"
                                 :disabled="loading || nonChangeMarkdown || markdownText === ''"
                                 type="primary" color="#333333">提交</el-button>
                    </el-col>
                  </el-row>
                </tc-container-full-row>
              </template>
              <v-md-editor v-model="markdownText"
                           height="80vh"
                           :autofocus="true"
                           @save="saveMarkdown"
                           placeholder="请在此处编写课程教材文档"
                           :default-show-toc="true"
              ></v-md-editor>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 编辑视频教材 -->
      <div v-show="!showChoose && radioVal === '讲解视频录像'">
        <el-row>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="left">
            <el-card shadow="never" style="border-top: none;border-bottom:none;overflow-y: auto"  v-loading="loading">
              <template #header>
                <tc-container-full-row>
                  <el-row>
                    <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" align="left">
                      <h3 style="margin-top: 0;margin-bottom: 0;user-select: none">|&nbsp;&nbsp;{{ chapterName }}</h3>
                    </el-col>
                  </el-row>
                </tc-container-full-row>
              </template>
              <el-row>
                <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
                </el-col>
                <el-col :xs="16" :sm="16" :md="16" :lg="16" :xl="16">
                  <el-card shadow="never">
                    <el-upload
                        drag
                        limit="2"
                        :auto-upload="false"
                        :on-change="handChange"
                        :on-remove="handRemove"
                        v-if="showUploadVideo"
                    >
                      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                      <div class="el-upload__text">
                        拖动视频至此处 <em>点击上传</em>
                      </div>
                      <template #tip>
                        <div class="el-upload__tip">
                          only supports uploading one <strong>video</strong> at a time
                        </div>
                      </template>
                    </el-upload><br/>
                    <div v-if="showProgress">
                      <el-progress style="width: 100%;height: auto"
                                   :percentage="uploadProgress"
                                   :color="uploadColors"/><br/>
                    </div>

                    <!-- 视频 -->
                    <vue3VideoPlay v-bind="playOptions">

                    </vue3VideoPlay>

                    <el-divider/>
                    <el-row>
                      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="center">
                        <el-button @click="showChoose = !showChoose" :disabled="isSubmit">返回</el-button>
                        <el-button @click="uploadLocalFile('video')" type="primary"
                                   :loading="isSubmit"
                                   :disabled="localFile === ''">上传</el-button>
                      </el-col>
                    </el-row>
                  </el-card>
                </el-col>
                <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-col>
  </el-row>

  <el-dialog v-model="showUploadMarkdownDialog"
             v-if="showUploadMarkdownDialog"
             width="45%"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             title="上传本地文档"
             :lock-scroll="false"
             destroy-on-close
  >
    <el-upload
        drag
        limit="2"
        :auto-upload="false"
        :on-change="handChange"
        :on-remove="handRemove"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        拖动文档至此处 <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          only supports uploading one <strong>markdown</strong> document at a time
        </div>
      </template>
    </el-upload><br/>
    <el-divider/>
    <el-row>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="center">
        <el-button @click="showUploadMarkdownDialog = false" :disabled="isSubmit">取消</el-button>
        <el-button @click="uploadLocalFile('markdown')" type="primary"
                   :loading="isSubmit"
                   :disabled="localFile === ''">提交</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<style scoped>

</style>