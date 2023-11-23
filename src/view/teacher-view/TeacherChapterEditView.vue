<script setup>
import {onMounted, reactive, ref, watch, watchEffect} from "vue";
import {useRouter} from "vue-router";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {calculateHash, generateRandomHash} from "@/utils/dataUtil";
import {
  deleteResourceLesson,
  fileSliceSize,
  getResourceLesson, getResourceLessonType,
  reUploadLessonResource,
  uploadLessonResource
} from "@/api/resource-api";
import {withLoading, withPreLoading} from "@/utils/functionUtil";
import {ElMessage} from "element-plus";
import {UploadFilled, Document, Delete, ArrowLeft, Close, Upload, View} from "@element-plus/icons-vue";
import TcVideo from "@/components/video/tc-video.vue";
import {getVideoTestList} from "@/api/plan-api";
import AddVideoTestDialog from "@/view/teacher-view/dialog/AddVideoTestDialog.vue";
import GetVideoTestListDialog from "@/view/teacher-view/dialog/GetVideoTestListDialog.vue";
import VideoTestDialog from "@/components/dialog/video-test-dialog.vue";
import {videoURL} from "@/api/url-api";


// 定义全局变量
const preLoading = ref(false)
const loading = ref(false)

const router = useRouter()
const lessonId = router.currentRoute.value.query.lesson_id
const chapterId = router.currentRoute.value.query.chapter_id
const chapterName = router.currentRoute.value.query.chapter_name
const resourceId = router.currentRoute.value.query.resource_id
const isVideo = router.currentRoute.value.query.isVideo

const chapterObj = reactive({
  chapter_name: chapterName
})
const radioVal = ref('')
const showChoose = ref(true)


// 此部分定义获取教材状态并进行资源预加载、radio反例禁用逻辑
const tagType = ref("danger")
const tagTextMap = {
  "danger": "未上传",
  "success": "已上传"
}
const nonMarkdown = ref(false)
const nonVideo = ref(false)

// 设置教材状态
const setResourceLessonState = async () => {
  // 如果存在资源ID，说明该教材资源存在
  if (resourceId) {
    // 将状态标签设置为success
    tagType.value = "success"
    // 设置教材资源类别
    await setResourceType()
  }
}

// 预加载教材
const setResourceType = withPreLoading(async () => {
  const res = await getResourceLessonType(resourceId)
  if (res.code === 2002) {
    // 加载成功时，根据教材类型禁用反例选项
    disableResourceTypeRadio(res.data)
  }
}, preLoading)

// 根据教材类型禁用反例选项
const disableResourceTypeRadio = (contentType) => {
  if (contentType.includes('md')) {
    nonVideo.value = true
    radioVal.value = 'Markdown文档'
  } else if (contentType.includes('mp4')) {
    nonMarkdown.value = true
    radioVal.value = '讲解视频录像'
  }
}


// 定义 下一步 事件
const nextStep = async () => {
  showChoose.value = !showChoose.value
  if (nonVideo.value) {
    // 如果不是视频，则加载 markdown 文档
    await loadingMarkdown()
  } else if (nonMarkdown.value) {
    // 如果不是markdown，则加载 video 及其视频测试题
    loadingVideo(null)
    await loadingVideoTest()
  }
}

// 加载 markdown 文档
const loadingMarkdown = withLoading(async () => {
  const res = await getResourceLesson(resourceId)
  markdownText.value = String(res.data)
}, loading)

// 加载视频
const videoUrl = ref()
const loadingVideo = (rId) => {
  showUploadVideo.value = false
  if (rId) {
    videoUrl.value = videoURL(rId)
  } else {
    videoUrl.value = videoURL(resourceId)
  }
}

// 初始化和加载视频测试题
const videoTest = reactive({
  answerList: [],
  pauseTimeList: [],
  testTimeList: []
})
const videoTestLength = ref(0)
const testList = ref()

const loadingVideoTest = async () => {
  const res = await getVideoTestList(resourceId)
  if (res.code === 2002) {
    // 赋值视频测试题列表
    testList.value = res.data
    videoTestLength.value = testList.value.length

    // 获取需要出现试题的时间列表
    videoTest.pauseTimeList = res.data.map(obj => ({id: obj.id, test_time: obj.test_time}))
    if (videoTest.pauseTimeList.length > 0) {
      videoTest.testTimeList = videoTest.pauseTimeList.map(({test_time}) => (test_time))
    }

  }
}


// Markdown 编辑器相关
const markdownText = ref('')

// 本地保存 Markdown 文档
const saveMarkdown = async (text) => {
  const markdownFile = new Blob([text], {type: 'text/markdown'});
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(markdownFile);
  downloadLink.download = chapterName + '.md';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// 上传提交 Markdown 文档和重传机制
const nonReUpload = ref(true)  // 非重传状态
if (resourceId) {
  // 存在资源ID时，必定重传
  nonReUpload.value = false
}
const nonChangeMarkdown = ref(true)
// 为文档时，可以通过比较文档内容与预载入内容是否一致判断重传
watch(markdownText, (newVal, oldVal) => {
  if (newVal !== oldVal && oldVal !== '') {
    nonChangeMarkdown.value = false
  }
})


// 提交教材文件
const submitFile = withLoading(async () => {
  // 提交时，如果使用进度条，则取消圈型加载
  if (showProgress.value) {
    loading.value = false
  }

  let file, fileName
  if (localFile.value) {
    // 存在本地文件时，提交本地文件
    file = localFile.value["raw"]
    fileName = localFile.value["name"]
  } else {
    // 不存在本地文件，则必定为 markdown 编辑器内容
    file = new Blob([markdownText.value], {type: 'text/markdown'});
    fileName = await generateRandomHash() + '.md'
  }

  // 计算文件哈希、大小、切片量
  const hash = await calculateHash(file)
  const size = file.size
  const totalSlice = getFileTotalSlice(size)

  // 上传教材资源文件
  await uploadResource(file, hash, size, totalSlice, fileName)

  if (showProgress.value) {
    showProgress.value = false
  }
}, loading)

// 获取文件切片量
const getFileTotalSlice = (size) => {
  return Math.ceil(size / fileSliceSize)
}

// 上传教材资源
const uploadProgress = ref(0)  // 进度条
const uploadColors = [
  {color: '#f56c6c', percentage: 20},
  {color: '#e6a23c', percentage: 40},
  {color: '#1989fa', percentage: 60},
  {color: '#6f7ad3', percentage: 80},
  {color: '#5cb87a', percentage: 100},
]  // 进度条颜色
const uploadResource = async (file, hash, size, totalSlice, fileName) => {
  for (let i = 1; i <= totalSlice; i++) {
    // 获取当前切片并定义文件对象
    let chunk = calculationChunk(i, totalSlice, file, size)
    let obj = setResourceLessonObj(chunk, hash, size, totalSlice, i, fileName)

    // 判断上传文件还是重传文件
    let res
    if (nonReUpload.value) {
      res = await uploadLessonResource(obj)
    } else {
      res = await reUploadLessonResource(obj)
    }

    if (res.msg === "当前文件片段上传成功" && showProgress) {
      // 切片上传成功时，递增进度条
      uploadProgress.value = Math.floor((i / totalSlice) * 100);
    } else if (res.msg.includes("教材上传成功") || res.msg.includes("教材资源上传成功")) {
      // 整份文件上传成功时，返回提示消息
      ElMessage.success(res.msg + "，章节：" + chapterName)
      resourceId ? location.reload() : window.location.href = '/teacher'
      break
    }

  }
}

// 计算当前文件切片
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


// 上传本地文件
const showUploadMarkdownDialog = ref(false)
const showProgress = ref(false)
const localFile = ref('')
const showUploadVideo = ref(true)
watchEffect(async () => {
  if (isVideo) {
    showUploadVideo.value = false
    loadingVideo(null)
    await loadingVideoTest()
  }
})

const uploadLocalFile = async (type) => {
  switch (type) {
    case 'markdown':
      showUploadMarkdownDialog.value = false
      break
    case 'video':
      if (!nonReUpload.value) {
        showUploadVideo.value = true
      }
      showProgress.value = true
      break
    default:
      break
  }
  await submitFile()
}

// 改变文件时
const handChange = (file, fileList) => {
  localFile.value = file
  if (fileList.length > 1) {
    fileList.splice(0, 1);
  } else if (!showUploadVideo.value && !file.name.includes('.md')) {
    ElMessage.warning("仅支持上传markdown文档")
    fileList.splice(0, 1);
  }
}

// 文件移除时
const handRemove = () => {
  localFile.value = ''
}

// 返回
const back = () => {
  showChoose.value = !showChoose.value
  let obj = {
    lesson_id: lessonId,
    chapter_id: chapterId,
    chapter_name: chapterName,
  }
  if (resourceId) {
    obj.resource_id = resourceId
  }
  if (router.currentRoute.value.fullPath.includes('isVideo')) {
    router.push({
      path: '/teacher/edit',
      query: obj,
    }).then(() => {
      window.location.reload();
    })
  }else {
    router.push({
      path: '/teacher/edit',
      query: obj,
    }).then(() => {
      window.location.reload();
    })
  }
}


// 删除已上传的教材资源
const deleteFile = withLoading(async () => {
  const res = await deleteResourceLesson(chapterId)
  if (res.code === 2002) {
    ElMessage.success(res.msg)
    window.location.href = '/teacher/edit?lesson_id=' + lessonId + '&chapter_id=' + chapterId + '&chapter_name=' + chapterName
  }
}, loading)


// 展示 添加视频测试题 对话框
const currentTime = ref(0)
const showAddVideoTest = ref(false)
const closeAddVideoTest = async (des) => {
  showAddVideoTest.value = false
  if (des.split('-')[0] !== 'cancel') {
    recoveryPreviewState()
    currentTime.value = 0
    await loadingVideoTest()
  }
}

// 展示 视频测试题列表 对话框框
const showGetVideoTestList = ref(false)
const closeGetVideoTest = async (des) => {
  showGetVideoTestList.value = false
  if (des.split('-')[0] !== 'cancel') {
    recoveryPreviewState()
    await loadingVideoTest()
  }
}

// 设置预览模式
const isPreview = ref(false)
const preViewText = ref('模拟学生视角')
const onPreview = () => {
  isPreview.value = !isPreview.value

  isPreview.value ? ElMessage.info("正在模拟学生视角") : ElMessage.info("已停止模拟")
  isPreview.value ? preViewText.value = '停止模拟' : preViewText.value = '模拟学生视角'

  sessionStorage.removeItem('trueTestTime')
}
const recoveryPreviewState = () => {
  isPreview.value = false
  preViewText.value = '模拟学生视角'
  sessionStorage.removeItem('trueTestTime')
}

// 视频测试题相关
const showVideoTest = ref(false)
const isPlay = ref(false)
const seekingTime = ref() // 正在跳帧的时间

// 监听视频时间
const isPauseVideo = ref(false)
const question = ref()
const isExitFullScreen = ref(false)
watchEffect(() => {
  if (isPreview.value && currentTime.value && videoTest.testTimeList.length > 0) {
    // 如果当前时间刚好与测试时间相同，则触发暂停时间
    if (videoTest.testTimeList.indexOf(currentTime.value) !== -1) {
      question.value = testList.value.find(obj => obj.test_time === currentTime.value)

      // 启动暂停，停止播放
      isPauseVideo.value = true
      isPlay.value = false

      // 展示题目,并退出全屏
      isExitFullScreen.value = true
      showVideoTest.value = true
    }
  }
})

// 监听跳帧事件（当处于预览模式时）
const seekTime = ref() // 想要恢复的跳帧时间
watchEffect(() => {
  // 处于预览模式，并拥有跳帧数值时
  if (isPreview.value && seekingTime.value) {
    // 从会话中获取视频测试题通过时间坐标
    let trueTestTimeList = []
    if (sessionStorage.getItem('trueTestTime')) {
      let strTrueTestTime = sessionStorage.getItem('trueTestTime')
      trueTestTimeList = strTrueTestTime.split(',').map(Number)
    }
    // 获取仍未答题的时间
    const uniqueA = trueTestTimeList.filter((element) => !testList.value.map((obj) => (obj.test_time)).includes(element));
    const uniqueB = testList.value.map((obj) => (obj.test_time)).filter((element) => !trueTestTimeList.includes(element));
    let waitingAnswerTimeList = [...uniqueA, ...uniqueB]

    // 如果跳帧的时间大于仍未答题的时间
    if (seekingTime.value > waitingAnswerTimeList.sort((a, b) => a - b)[0]) {
      ElMessage.warning({
        grouping: true,
        message: "尚有试题未回答，无法快进"
      })
      // 将跳帧时间恢复为上一次答题通过时间秒数 + 1s
      if (trueTestTimeList.length > 0) {
        seekTime.value = Number(trueTestTimeList[trueTestTimeList.length - 1]) + 1 + '-' + Math.random()
      } else {
        // 或者一题未答，则从1s开始
        seekTime.value = 1 + '-' + Math.random()
      }
    }
  }
})

// 关闭视频试题（答对时）
const closeVideoTest = (des) => {
  // 重置退出全屏状态
  showVideoTest.value = false
  isExitFullScreen.value = false

  if (des.split('-')[0] !== 'cancel') {
    // 保存答对的试题出现时间
    if (sessionStorage.getItem('trueTestTime') !== null) {
      let newTrueTestTime = sessionStorage.getItem('trueTestTime') + ',' + des.split('-')[3]
      sessionStorage.setItem('trueTestTime', newTrueTestTime)
    } else {
      sessionStorage.setItem('trueTestTime', des.split('-')[3])
    }
    isPlay.value = true
  }
}

// 监听页面关闭事件，关闭时，清空答题状态
window.addEventListener('unload', function () {
  sessionStorage.removeItem('trueTestTime')
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
      <el-card shadow="never" style="width: 50%;margin-top: 20px" v-show="!isVideo && showChoose"
               v-loading="preLoading" align="left">
        <template #header>
          <div class="card-header">
            <el-row style="display: flex; align-items: center;">
              <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1">
                <el-button @click="router.push('/teacher')" :disabled="loading" :icon="Close" style="border: none" circle/>
              </el-col>
              <el-col :xs="17" :sm="17" :md="17" :lg="17" :xl="17">
                <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;编辑章节信息</h3>
              </el-col>
              <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right;">
                <el-button type="primary"
                           @click="nextStep"
                           :disabled="radioVal === ''"
                           color="#333333" round >
                  下一步
                </el-button>
              </el-col>
            </el-row>
          </div>
        </template><br/>
        <el-row>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
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
                <el-tag :type="tagType === 'success' ? 'success' : 'danger'">{{ tagTextMap[tagType] }}</el-tag>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row><br/>
      </el-card>

      <!-- 编辑markdown文档 -->
      <div v-show="!showChoose && radioVal === 'Markdown文档'">
        <el-row>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="left">
            <el-card shadow="never" style="border-top: none;overflow-y: auto" v-loading="loading">
              <template #header>
                <tc-container-full-row>
                  <el-row>
                    <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" align="left">
                      <h3 style="margin-top: 0;margin-bottom: 0;user-select: none">|&nbsp;&nbsp;{{ chapterName }}</h3>
                    </el-col>
                    <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18" align="right">
                      <el-button @click="showChoose = !showChoose"
                                 style="width: 20px"
                                 :disabled="loading" :icon="ArrowLeft"/>
                      <el-button @click="deleteFile"
                                 :icon="Delete" :disabled="loading || !resourceId">删除
                      </el-button>
                      <el-button @click="showUploadMarkdownDialog = true"
                                 :icon="Document">本地上传
                      </el-button>
                      <el-button @click="submitFile"
                                 :disabled="loading || nonChangeMarkdown || markdownText === ''"
                                 type="primary" color="#333333">提交
                      </el-button>
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
      <div v-show="!showChoose && radioVal === '讲解视频录像' || isVideo">
        <el-row>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="left">
            <el-card shadow="never" style="border-top: none;border-bottom:none;overflow-y: auto" v-loading="loading">
              <el-row>
                <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4" />
                <el-col :xs="16" :sm="16" :md="16" :lg="16" :xl="16">
                  <el-card shadow="never">
<!--                    头部-->
                    <template #header>
                      <div class="card-header">
                        <el-row v-if="!showUploadVideo" style="display: flex;align-items: center">
                          <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1" align="left">
                            <el-button @click="back" :disabled="showProgress" :icon="ArrowLeft" style="border: none" circle/>
                          </el-col>
                          <el-col :xs="13" :sm="13" :md="13" :lg="13" :xl="13" align="left">
                            <h3 style="margin-top: 0;margin-bottom: 0">编辑视频测试题</h3>
                          </el-col>
                          <el-col :xs="10" :sm="10" :md="10" :lg="10" :xl="10" style="text-align: right">
                            <el-button @click="deleteFile"
                                       text
                                       type="danger" :disabled="showProgress" round>删除视频
                            </el-button>
                            <el-button type="primary"
                                       :icon="Upload"
                                       @click="uploadLocalFile('video')"
                                       :disabled="showProgress" round>更换视频源
                            </el-button>
                          </el-col>
                        </el-row>
                        <el-row v-if="showUploadVideo" style="display: flex;align-items: center">
                          <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1" align="left">
                            <el-button @click="back" :disabled="showProgress" :icon="ArrowLeft" style="border: none" circle/>
                          </el-col>
                          <el-col :xs="17" :sm="17" :md="17" :lg="17" :xl="17" align="left">
                            <h3 style="margin-top: 0;margin-bottom: 0">上传视频教材</h3>
                          </el-col>
                          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right">
                            <el-button @click="uploadLocalFile('video')" type="primary"
                                       :icon="Upload" :disabled="localFile === '' || showProgress">确认上传
                            </el-button>
                          </el-col>
                        </el-row>
                      </div>
                    </template>
<!--                    上传视频-->
                    <el-upload
                        drag
                        :limit="2"
                        :auto-upload="false"
                        :on-change="handChange"
                        :on-remove="handRemove"
                        v-if="showUploadVideo"
                        :disabled="showProgress"
                    >
                      <el-icon class="el-icon--upload">
                        <upload-filled/>
                      </el-icon>
                      <div class="el-upload__text">
                        拖动视频至此处 <em>点击上传</em>
                      </div>
                      <template #tip>
                        <div class="el-upload__tip">
                          only supports uploading one <strong>video</strong> at a time
                        </div>
                      </template>
                    </el-upload>
                    <div v-if="showProgress">
                      <br/>
                      <el-progress style="width: 100%;height: auto"
                                   :percentage="uploadProgress"
                                   :color="uploadColors"/>
                      <br/>
                    </div>
                    <!-- 视频 -->
                    <el-row v-if="!showUploadVideo">
                      <el-col :xs="24" :sm="14" :md="14" :lg="24" :xl="14" align="center">
                        <tc-video :video-url="videoUrl"
                                  :pause-time-list="videoTest.pauseTimeList"
                                  :is-pause="isPauseVideo"
                                  :is-play="isPlay"
                                  :is-exit-full-screen="isExitFullScreen"
                                  :seek-time="seekTime"
                                  :width="640" :height="360"
                                  @get-current-time="(time) => { currentTime = time}"
                                  @get-seeking-time="(time) => { seekingTime = time}"
                                  @get-play="(state) => {isPauseVideo = !state; isPlay = state}"/><br/>
                      </el-col>
                      <!-- 视频测试题 -->
                      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="center">
                        <el-button :disabled="videoTestLength === 0"
                                   :icon="View" @click="onPreview" size="large" round v-btn>{{ preViewText }}</el-button>
                        <el-button :disabled="videoTestLength === 0"
                                   @click="showGetVideoTestList = true" size="large" round v-btn>
                          当前试题列表&nbsp;{{ videoTestLength }} / 4
                        </el-button>
                        <el-button type="primary" color="#333"
                                   @click="showAddVideoTest = true"
                                   :disabled=" currentTime === 0 || videoTestLength === 4" size="large" round v-btn>增加试题
                        </el-button>
                      </el-col>
                    </el-row><br/>
                  </el-card>
                </el-col>
                <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4" />
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
        :limit="2"
        :auto-upload="false"
        :on-change="handChange"
        :on-remove="handRemove"
    >
      <el-icon class="el-icon--upload">
        <upload-filled/>
      </el-icon>
      <div class="el-upload__text">
        拖动文档至此处 <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          only supports uploading one <strong>markdown</strong> document at a time
        </div>
      </template>
    </el-upload>
    <br/>
    <el-divider/>
    <el-row>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="center">
        <el-button @click="showUploadMarkdownDialog = false">取消</el-button>
        <el-button @click="uploadLocalFile('markdown')" type="primary"
                   :disabled="localFile === ''">提交
        </el-button>
      </el-col>
    </el-row>
  </el-dialog>

  <AddVideoTestDialog :show-add-video-test-dialog="showAddVideoTest"
                      :current-time=" currentTime "
                      :resource-id="Number(resourceId)"
                      @close-dialog="closeAddVideoTest"/>

  <GetVideoTestListDialog :show-get-video-test-dialog="showGetVideoTestList"
                          :test-list="testList"
                          @close-get-video-test-dialog="closeGetVideoTest"/>
  <video-test-dialog :dialog="showVideoTest"
                     :test-obj="question"
                     @close="closeVideoTest"/>
</template>

<style scoped>

</style>