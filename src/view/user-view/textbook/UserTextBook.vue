<script setup>
import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {getResourceLesson} from "@/api/resource-api";
import {withLoading} from "@/utils/functionUtil";
import {ChatLineSquare, ChatSquare, EditPen, Memo} from "@element-plus/icons-vue";
import {
  deleteChildrenComment,
  deleteFatherComment,
  getChapterCommentList, likeOrUnlikeChildrenComment,
  likeOrUnlikeFatherComment,
  sendChildrenReply,
  sendFatherComment,
  sendFatherReply
} from "@/api/learn-api";
import {ElMessage} from "element-plus";
import {isJsonString} from "@/utils/dataUtil";

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

const uid = ref(sessionStorage.getItem('uid'))
onMounted(async () => {
  if (resourceId.value) {
    await loadingTextBook()
    await loadingFatherCommentList(0)
  }
})
</script>

<template>
  <el-row>
    <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4"/>
    <el-col :xs="16" :sm="16" :md="16" :lg="16" :xl="16">
      <el-skeleton :rows="5" animated v-if="loading"/>
      <el-card v-loading="loading" shadow="never" style="border: none">
        <v-md-preview :text="mdContent" v-if="!loading"></v-md-preview>
      </el-card>
    </el-col>
    <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4"/>
  </el-row>
  <!--点击某个案件，滚动到下面的组件-->

  <el-row style="background-color: #f4f4f4;" ref="scrollToElement">
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
        <el-button type="primary" color="#f1f2f3" round :icon="Memo">
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
          <span>{{ item.content }}</span><br/><br/>
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
              <el-text>回复{{ JSON.parse(childItem.content)['reply_mark'] }}：</el-text>
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
                <span>回复<el-text>@{{ childItem['real_name'] }}</el-text></span>
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

  <el-backtop :right="130" :bottom="200" style="color: #333"/>
  <el-backtop :right="130" :bottom="140" style="color: #333">
    <el-icon>
      <EditPen/>
    </el-icon>
  </el-backtop>
  <el-backtop :right="130" :bottom="80" style="color: #333" @click="scrollToComment">
    <el-icon>
      <ChatLineSquare/>
    </el-icon>
  </el-backtop>

</template>

<style scoped>

</style>