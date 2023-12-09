<script setup>
import {useRouter} from "vue-router";
import {onBeforeMount, reactive, ref, watchEffect} from "vue";
import {getResourceLesson, uploadNote} from "@/api/resource-api";
import {withLoading} from "@/utils/functionUtil";
import {ChatLineSquare, ChatSquare, Close, EditPen, Memo} from "@element-plus/icons-vue";
import {
  deleteChildrenComment,
  deleteFatherComment,
  getChapterCommentList, getNote, likeOrUnlikeChildrenComment,
  likeOrUnlikeFatherComment,
  sendChildrenReply,
  sendFatherComment,
  sendFatherReply, sendNote
} from "@/api/learn-api";
import {ElMessage} from "element-plus";
import {generateRandomHash, isJsonString} from "@/utils/dataUtil";
import {setChapterOver} from "@/api/progress-api";
import TcVideo from "@/components/video/tc-video.vue";
import {videoURL} from "@/api/url-api";
import {getVideoTestList} from "@/api/plan-api";
import VideoTestDialog from "@/components/dialog/video-test-dialog.vue";

const loading = ref(false)
const router = useRouter()
const resourceType = ref(router.currentRoute.value.query.resourceType)
const resourceId = ref(router.currentRoute.value.query.resourceId)
const lessonId = ref(router.currentRoute.value.query.lessonId)
const chapterId = ref(router.currentRoute.value.query.chapterId)


// 文档
const mdContent = ref('')
const loadingTextBook = withLoading(async () => {
  const res = await getResourceLesson(resourceId.value)
  if (res.status === 200) {
    if (resourceType.value === 'md') {
      mdContent.value = res.data
    }
  }
}, loading)


// 将视区滚动到评论区
const scrollToElement = ref()
const scrollToComment = () => {
  // 获取要滚动到的元素
  if (scrollToElement.value) {
    // 使用元素的 offsetTop 属性来计算滚动位置
    const offsetTop = scrollToElement.value.$el.offsetTop
    // 使用 window.scrollTo() 方法进行页面滚动
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth' // 添加 smooth 选项可以平滑滚动
    });
  }
}


// 发表主评论
const commentLoading = ref(false)
const fatherContent = ref('')
const submitFatherContent = async () => {
  if (!fatherContent.value) {
    ElMessage.warning('评论内容不能为空')
  } else {
    commentLoading.value = true
    const obj = {
      "user_id": sessionStorage.getItem("uid"),
      "lesson_id": lessonId.value,
      "chapter_id": chapterId.value,
      "content": fatherContent.value
    }
    const res = await sendFatherComment(obj)
    if (res.code === 2002) {
      ElMessage.success(res.msg)
      fatherContent.value = ''
    }
    commentLoading.value = false

    await loadingFatherCommentList(0)
  }
}


// 获取评论列表
const fatherCommentList = ref([])
const loadingFatherCommentList = async (offset) => {
  commentLoading.value = true
  const res = await getChapterCommentList(lessonId.value, chapterId.value, sessionStorage.getItem("uid"), offset)
  if (res.code === 2002) {
    fatherCommentList.value = res.data
  }
  commentLoading.value = false
}


// 点赞
const likeFatherComment = async (item) => {
  if (item['like_state'] === 1) {
    item['like_state'] = 0
    item['like_sum'] -= 1
  } else {
    item['like_state'] = 1
    item['like_sum'] += 1
  }
  const res = await likeOrUnlikeFatherComment(sessionStorage.getItem("uid"), item['id'], item['like_state'])
  if (res.code !== 2002) {
    if (item['like_state'] === 1) {
      item['like_state'] = 0
      item['like_sum'] -= 1
    } else {
      item['like_state'] = 1
      item['like_sum'] += 1
    }
  }
}


// 回复主评论
const fatherReplyContent = ref('')
const showFatherReply = ref()
const replyFatherComment = async (item) => {
  const obj = {
    "user_id": sessionStorage.getItem("uid"),
    "comment_id": item['id'],
    "content": fatherReplyContent.value
  }
  const res = await sendFatherReply(obj)
  if (res.code === 2002) {
    showFatherReply.value = null
    fatherReplyContent.value = ''
    await loadingFatherCommentList(0)
  }
}


// 回复子评论
const childrenReplyContent = ref('')
const showChildrenReply = ref()
const replyChildrenComment = async (commentId, childItem) => {
  const obj = {
    "user_id": sessionStorage.getItem("uid"),
    "comment_id": commentId,
    "content": {
      "reply_user_id": childItem['id'],
      "reply_mark": "@" + childItem['real_name'],
      "reply_content": childrenReplyContent.value
    }
  }
  const res = await sendChildrenReply(obj)
  if (res.code === 2002) {
    showChildrenReply.value = null
    childrenReplyContent.value = ''
    await loadingFatherCommentList(0)
  }
}


// 点赞子评论
const likeChildrenComment = async (item) => {
  if (item['like_state'] === 1) {
    item['like_state'] = 0
    item['like_sum'] -= 1
  } else {
    item['like_state'] = 1
    item['like_sum'] += 1
  }
  const res = await likeOrUnlikeChildrenComment(sessionStorage.getItem("uid"), item['id'], item['like_state'])
  if (res.code !== 2002) {
    if (item['like_state'] === 1) {
      item['like_state'] = 0
      item['like_sum'] -= 1
    } else {
      item['like_state'] = 1
      item['like_sum'] += 1
    }
  }
}


// 删除主评论
const removeFatherComment = async (commentId) => {
  const res = await deleteFatherComment(commentId)
  if (res.code === 2002) {
    ElMessage.success(res.msg)
    await loadingFatherCommentList(0)
  }
}


// 删除子回复
const removeChildrenComment = async (replyId) => {
  const res = await deleteChildrenComment(replyId)
  if (res.code === 2002) {
    ElMessage.success(res.msg)
    await loadingFatherCommentList(0)
  }
}


// 编写学习笔记
const showEditNote = ref(false)
const openEditView = () => {
  showEditNote.value = true
  window.scrollTo({
    top: window.pageYOffset,
    behavior: 'smooth'
  });
}

// 提交笔记
const noteLoading = ref(false)
const noteObj = reactive({
  note_title: "",
  note_des: "",
  resource_note_id: Number
})
const markdownText = ref('')
const submitNote = async () => {
  if (!noteObj.note_title) {
    ElMessage.warning("笔记标题不能为空")
  } else if (!noteObj.note_des) {
    ElMessage.warning("笔记描述不能为空")
  } else if (!markdownText.value) {
    ElMessage.warning("笔记内容不能为空")
  } else {
    noteLoading.value = true
    const resourceId = await submitNoteResource()
    if (resourceId) {
      const obj = {
        "note_title": noteObj.note_title,
        "note_des": noteObj.note_des,
        "resource_note_id": resourceId
      }
      const res = await sendNote(sessionStorage.getItem("uid"), lessonId.value, chapterId.value, obj)
      if (res.code === 2002) {
        showEditNote.value = false
        ElMessage.success(res.msg)
        await loadingFatherCommentList(0)
      }
    }
  }
  noteLoading.value = false
}

const submitNoteResource = async () => {
  const fileName = await generateRandomHash()
  let file = new File([new Blob([markdownText.value], {type: 'text/markdown'})], fileName + '.md')
  const obj = {
    lesson_id: lessonId.value,
    chapter_id: chapterId.value,
    up_id: sessionStorage.getItem("uid"),
    note_title: noteObj.note_title,
    note_des: noteObj.note_des,
    note_file: file
  }
  const res = await uploadNote(obj)
  if (res.code === 2002) {
    return res.data
  } else {
    return null
  }
}

// 本地保存笔记
const saveMarkdown = async (text) => {
  const markdownFile = new Blob([text], {type: 'text/markdown'});
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(markdownFile);
  let fileName = "default"
  if (noteObj.note_title) {
    fileName = noteObj.note_title
  }
  downloadLink.download = fileName + '.md';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// 查看笔记详情
const showNoteDetail = ref(false)
const noteDetail = ref('')
const viewNoteDetail = async (resourceId) => {
  const res = await getNote(resourceId)
  if (res.status === 200) {
    noteDetail.value = res.data
    showNoteDetail.value = true
  }
}

const uid = ref(sessionStorage.getItem('uid'))
const videoUrl = ref()
// 初始化和加载视频测试题
const videoTest = reactive({
  answerList: [],
  pauseTimeList: [],
  testTimeList: []
})
const videoTestLength = ref(0)
const testList = ref()
const loadingVideoTest = async () => {
  const res = await getVideoTestList(resourceId.value)
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

// 视频测试题相关
const showVideoTest = ref(false)
const isPlay = ref(false)
const seekingTime = ref() // 正在跳帧的时间
const isPreview = ref(true)
const currentTime = ref(0)

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

const isVideoEnd = ref(false)

watchEffect(async () => {
  if (isVideoEnd.value){
    await setChapterOver(lessonId.value, chapterId.value, sessionStorage.getItem("uid"))
  }
})

// 监听页面关闭事件，关闭时，清空答题状态
window.addEventListener('unload', function () {
  sessionStorage.removeItem('trueTestTime')
});

const pageLoading = ref(false)
onBeforeMount(async () => {
  pageLoading.value = true
  if (resourceId.value) {
    await loadingFatherCommentList(0)
    if (resourceType.value === 'md') {
      await loadingTextBook()
      await setChapterOver(lessonId.value, chapterId.value, sessionStorage.getItem("uid"))
    } else {
      loading.value = true
      videoUrl.value = videoURL(resourceId.value)
      await loadingVideoTest()
      loading.value = false
    }
  }
  pageLoading.value = false
})
</script>

<template>
  <el-progress color="#333"
               :percentage="50"  :duration="4" :indeterminate="true" :show-text="false"
               v-if="pageLoading"/>
  <div v-show="!pageLoading">
    <el-row>
      <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4"/>
      <el-col :xs="16" :sm="16" :md="16" :lg="16" :xl="16">
        <el-card v-loading="loading" shadow="never" style="border: none" v-if="resourceType === 'md'">
          <v-md-preview :text="mdContent" ></v-md-preview>
        </el-card>
        <el-card v-loading="loading" shadow="never" style="border: none" v-if="resourceType === 'mp4'" align="center">
          <br/><br/><tc-video :video-url="videoUrl"
                              :pause-time-list="videoTest.pauseTimeList"
                              :is-pause="isPauseVideo"
                              :is-play="isPlay"
                              :is-exit-full-screen="isExitFullScreen"
                              :seek-time="seekTime"
                              :width="640" :height="360"
                              @get-current-time="(time) => { currentTime = time}"
                              @get-seeking-time="(time) => { seekingTime = time}"
                              @get-play="(state) => {isPauseVideo = !state; isPlay = state}"
                              @get-end="(end) => { isVideoEnd = end }"
                              v-if="!loading"/><br/><br/>
        </el-card>
      </el-col>
      <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4"/>
    </el-row>


    <el-row style="background-color: #f4f4f4;" ref="scrollToElement" v-show="!loading">
      <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4"/>
      <el-col :xs="16" :sm="16" :md="16" :lg="16" :xl="16">
        <el-progress :percentage="50" color="#333" :duration="4" :indeterminate="true" :show-text="false" v-if="loading"/>
        <br/>
        <el-card shadow="never" style="border: none;border-radius: 0;height: 30vh" v-if="!loading">
          <el-text>发表评论</el-text>
          <el-input v-model="fatherContent" type="textarea" rows="3" style="margin-top: 10px"></el-input>
          <br/><br/>
          <el-button type="primary" color="#f1f2f3" round @click="submitFatherContent">
            <el-text>评论</el-text>
          </el-button>
          <el-button type="primary" color="#f1f2f3" round :icon="Memo" @click="openEditView">
            <el-text>编写笔记</el-text>
          </el-button>
        </el-card>
        <br/>
        <div v-loading="commentLoading">
          <el-card v-for="(item, index) in fatherCommentList" :key="index"
                   shadow="never" style="border: none;border-radius: 0;margin-bottom: 10px">
            <el-row><span style="font-size: 0.9rem">{{ item.real_name }}&nbsp;<el-tag style="font-size: 0.7rem"
                                                                                      type="warning" size="small" round>{{
                item['dept_name']
              }}</el-tag></span></el-row>
            <el-row><span style="font-size: 0.8rem;color: #909399">{{ item['creat_datetime'] }}</span></el-row>
            <br/>
            <div v-if="isJsonString(item['content'])">
              <el-tag type="info" size="small">学习笔记</el-tag>
              <span style="font-weight: bolder;">&nbsp;&nbsp;{{ JSON.parse(item['content'])['note_title'] }}</span><br/>
              <el-text type="info">{{ JSON.parse(item['content'])['note_des'] }}</el-text>
              <br/><br/>
              <el-link @click="viewNoteDetail(JSON.parse(item['content'])['resource_note_id'])">查看全文</el-link>
              <br/><br/>
            </div>
            <div v-else>
              <span>{{ item.content }}</span><br/><br/>
            </div>
            <el-row style="display: flex;align-items: center;user-select: none">

              <!--            回复-->
              <el-icon style="cursor: pointer;"
                       @click="showFatherReply !== index ? showFatherReply = index : showFatherReply = null">
                <ChatSquare/>
              </el-icon>&nbsp;&nbsp;<el-text type="info">{{ item['replyObj']['total'] }}</el-text>

              <!--            点赞-->
              <el-icon style="margin-left: 15px;cursor: pointer;user-select: none">
                <svg width="24" height="24" viewBox="0 0 48 48"
                     @click="likeFatherComment(item)"
                     :fill="item['like_state'] === 1 ? 'true' : 'none'">
                  <path
                      d="M7 17v26m35.17-21.394l-5.948 18.697a1 1 0 01-.953.697H14V19h3l9.403-12.223a1 1 0 011.386-.196l2.535 1.87a6 6 0 012.044 6.974L31 19h9.265a2 2 0 011.906 2.606z"
                      stroke="#333" stroke-width="3"/>
                </svg>
              </el-icon>&nbsp;&nbsp;<el-text type="info">{{ item['like_sum'] }}</el-text>

              &nbsp;&nbsp;<el-button text type="danger" size="small"
                                     @click="removeFatherComment(item['id'])"
                                     v-if="String(item['user_id']) === String(uid)">删除
            </el-button>
            </el-row>


            <!-- 评论回复-->
            <el-card v-for="(childItem, index) in item['replyObj']['list']" :key="index"
                     shadow="never" style="border: none;border-radius: 0;">
              <el-row><span style="font-size: 0.9rem">{{ childItem.real_name }}&nbsp;<el-tag style="font-size: 0.7rem"
                                                                                             type="warning" size="small"
                                                                                             round>{{
                  childItem['dept_name']
                }}</el-tag></span></el-row>
              <el-row><span style="font-size: 0.8rem;color: #909399">{{ childItem['create_datetime'] }}</span></el-row>
              <br/>
              <div v-if="isJsonString(childItem.content)">
                回复
                <el-text type="primary">{{ JSON.parse(childItem.content)['reply_mark'] }}</el-text>
                ：
                <span>{{ JSON.parse(childItem.content)['reply_content'] }}</span>
              </div>
              <div v-else>
                <span>{{ childItem.content }}</span>
              </div>
              <br/>
              <el-row style="display: flex;align-items: center;user-select: none">

                <!--            回复-->
                <el-icon style="cursor: pointer;"
                         @click="showChildrenReply !== index ? showChildrenReply = index : showChildrenReply = null">
                  <ChatSquare/>
                </el-icon>

                <!--            点赞-->
                <el-icon style="margin-left: 15px;cursor: pointer;user-select: none">
                  <svg width="24" height="24" viewBox="0 0 48 48"
                       @click="likeChildrenComment(childItem)"
                       :fill="childItem['like_state'] === 1 ? 'true' : 'none'">
                    <path
                        d="M7 17v26m35.17-21.394l-5.948 18.697a1 1 0 01-.953.697H14V19h3l9.403-12.223a1 1 0 011.386-.196l2.535 1.87a6 6 0 012.044 6.974L31 19h9.265a2 2 0 011.906 2.606z"
                        stroke="#333" stroke-width="3"/>
                  </svg>
                </el-icon>&nbsp;&nbsp;<el-text type="info">{{ childItem['like_sum'] }}</el-text>

                &nbsp;&nbsp;<el-button text type="danger" size="small"
                                       @click="removeChildrenComment(childItem['id'])"
                                       v-if="String(childItem['user_id']) === String(uid)">删除
              </el-button>
              </el-row>

              <!--          跟帖回复-->
              <el-row v-if="showChildrenReply === index">
                <el-card shadow="never" style="border-radius: 0;height: 30vh;width: 100%" v-loading="loading">
                  <span>回复<el-text type="primary">@{{ childItem['real_name'] }}</el-text></span>
                  <el-input v-model="childrenReplyContent" type="textarea" rows="3" style="margin-top: 10px"></el-input>
                  <br/><br/>
                  <el-button type="primary" color="#f1f2f3" round @click="replyChildrenComment(item['id'], childItem)">
                    <el-text>回复</el-text>
                  </el-button>
                </el-card>
              </el-row>
            </el-card>


            <el-row v-if="showFatherReply === index">
              <el-card shadow="never" style="border-radius: 0;height: 30vh;width: 100%" v-loading="loading">
                <el-text>回复此评论</el-text>
                <el-input v-model="fatherReplyContent" type="textarea" rows="3" style="margin-top: 10px"></el-input>
                <br/><br/>
                <el-button type="primary" color="#f1f2f3" round @click="replyFatherComment(item)">
                  <el-text>回复</el-text>
                </el-button>
              </el-card>
            </el-row>
          </el-card>
        </div>
      </el-col>
      <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4"/>
    </el-row>
  </div>


  <el-backtop :right="130" :bottom="200" style="color: #333"/>
  <el-backtop :right="130" :bottom="140" style="color: #333" @click="openEditView">
    <el-icon>
      <EditPen/>
    </el-icon>
  </el-backtop>
  <el-backtop :right="130" :bottom="80" style="color: #333" @click="scrollToComment">
    <el-icon>
      <ChatLineSquare/>
    </el-icon>
  </el-backtop>

  <el-dialog v-model="showEditNote"
             v-if="showEditNote"
             top="0"
             width="95%"
             style="border-radius: 15px;margin-top: 20px"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             :lock-scroll="false"
  >
    <template #header>
      <div class="card-header">
        <el-row style="display: flex; align-items: center;">
          <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1">
            <el-button @click="showEditNote = false" :icon="Close" :disabled="noteLoading" style="border: none" circle/>
          </el-col>
          <el-col :xs="17" :sm="17" :md="17" :lg="17" :xl="17">
            <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;编写学习笔记</h3>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right;">
            <el-button @click="submitNote" type="primary" color="#333" round :disabled="noteLoading">确认编写
            </el-button>
          </el-col>
        </el-row>
      </div>
    </template>
    <div v-loading="noteLoading">
      <el-form :model="noteObj" label-position="top">
        <el-form-item label="笔记标题">
          <el-input v-model="noteObj.note_title" maxlength="20" minlength="1" show-word-limit/>
        </el-form-item>
        <el-form-item label="笔记描述">
          <el-input v-model="noteObj.note_des" maxlength="50" minlength="1" show-word-limit/>
        </el-form-item>
        <el-form-item label="笔记正文">
          <v-md-editor v-model="markdownText"
                       height="80vh"
                       :autofocus="true"
                       @save="saveMarkdown"
                       placeholder="请在此处编写学习笔记"
                       :default-show-toc="true"
          ></v-md-editor>
        </el-form-item>

      </el-form>
    </div>
  </el-dialog>


  <el-dialog v-model="showNoteDetail"
             v-if="showNoteDetail"
             top="0"
             width="95%"
             style="border-radius: 15px;margin-top: 20px"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             :lock-scroll="false"
  >
    <template #header>
      <div class="card-header">
        <el-row style="display: flex; align-items: center;">
          <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1">
            <el-button @click="showNoteDetail = false" :icon="Close" style="border: none" circle/>
          </el-col>
          <el-col :xs="17" :sm="17" :md="17" :lg="17" :xl="17">
            <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;学习笔记正文</h3>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right;"/>
        </el-row>
      </div>
    </template>
    <div style="height: 100vh;overflow-y: auto">
      <v-md-preview :text="noteDetail"></v-md-preview>
    </div>
  </el-dialog>
  <video-test-dialog :dialog="showVideoTest"
                     :test-obj="question"
                     @close="closeVideoTest"/>

</template>

<style scoped>

</style>