<script setup>
import websiteIcon from "@/assets/website_icon.png";
import {Bell, MostlyCloudy, Reading} from "@element-plus/icons-vue";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {useRouter} from "vue-router";
import {computed, onBeforeMount, ref, watch} from "vue";
import {useDeptStore, useNotificationStore} from "@/store/store";
import {ElMessage} from "element-plus";
import {
  getAllNotificationList,
  getOtherTypeNotificationList,
  getPushClient,
  isReadNotification
} from "@/api/push-api";
import {notificationIconMap} from "@/utils/notificationUtil";
import PlanNotification from "@/components/notification/PlanNotification.vue";
import OtherNotification from "@/components/notification/OtherNotification.vue";
import ReplyNotification from "@/components/notification/ReplyNotification.vue";
import LikeFatherCommentNotification from "@/components/notification/LikeFatherCommentNotification.vue";
import LikeChildrenCommentNotification from "@/components/notification/LikeChildrenCommentNotification.vue";
import TestNotification from "@/components/notification/TestNotification.vue";
import {withLoading} from "@/utils/functionUtil";
import UserCenterDialog from "@/components/dialog/UserCenterDialog.vue";


const store = useDeptStore()
const notificationStore = useNotificationStore()
const deptId = computed(() => store.deptId)
const notificationState = computed(() => notificationStore.showNotification)
const router = useRouter()
const loading = ref(false)

const pushCloud = () => {
  if (deptId.value || sessionStorage.getItem("dept_id")) {
    router.push('/user/cloud')
  } else {
    ElMessage.warning("请等待当前页面加载完毕")
  }
}

// 通知
const notifyDrawer = ref(false)
const notificationList = ref([])
const showViewMore = ref(true)
const showNotification = ref(false)
const loadingAllNotification = withLoading(async (offset) => {
  const res = await getAllNotificationList(sessionStorage.getItem("uid"), 6, offset)
  if (res.code === 2002 && res.total !== 0) {
    notificationList.value.push(...res.data)
    showNotification.value = !notificationList.value.every(item => item['is_read'] === 1);
    showViewMore.value = res.total !== notificationList.value.length;
  }
}, loading)
const nowType = ref(0)

// 有新消息来临时
watch(notificationState, async (newVal, oldVal) => {
  if (newVal !== oldVal){
    showNotification.value = true
    notificationList.value.length = 0
    if (nowType.value !== 0){
      nowType.value = 0
    }else {
      await loadingAllNotification(0)
    }
  }
})


// 查看更多通知
const offset = ref(1)
const viewMore = async () => {
  offset.value += 1
  const realOffset = ((offset.value) - 1) * 6
  if (nowType.value === 0) {
    await loadingAllNotification(realOffset)
  } else {
    await loadingOtherTypeNotificationList(realOffset)
  }

}
// 当切换不同的类别通知时，需要初始化记录偏移量
watch(nowType, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    offset.value = 1
    notificationList.value.length = 0
    if (newVal === 0) {
      await loadingAllNotification(0)
    } else {
      await loadingOtherTypeNotificationList(0)
    }
  }
})

// 将通知消息标记为已读
const isRead = async (nid, readState) => {
  if (readState === 0) {
    const res = await isReadNotification(sessionStorage.getItem("uid"), nid)
    if (res.code === 2002) {
      notificationList.value.forEach(item => {
        if (item['id'] === nid) {
          item['is_read'] = 1
        }
      })
      if (notificationList.value.every(item => item['is_read'] === 1)) {
        showNotification.value = false
      }
    }
  }
}


// 获取不同类别的通知
const loadingOtherTypeNotificationList = withLoading(async (offset) => {
  const res = await getOtherTypeNotificationList(sessionStorage.getItem("uid"), nowType.value, offset)
  if (res.code === 2002 && res.total !== 0) {
    notificationList.value.push(...res.data)
    showViewMore.value = res.total !== notificationList.value.length;
  }
}, loading)

const showUserCenter = ref(false)
const closeUserCenter = (des) => {
  if (des){
    showUserCenter.value = false
  }
}


onBeforeMount(async () => {
  getPushClient()
  await loadingAllNotification(0)
})

</script>

<template>
  <!--顶部tag栏-->
  <tc-container-full-row>
    <el-card shadow="never" :body-style="{paddingBottom:'15px',paddingTop:'15px'}"
             style="border-radius: 0;height: 10vh">
      <el-row style="height: 5vh">
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <div style="display: flex;align-items: center;" @click="router.push('/user/lesson')">
            <img :src="websiteIcon" alt="404" style="width: 40px;height: 40px">
            <span class="menu-logo" style="margin-left: 5px">TrainingClient</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" align="right">
          <el-button style="margin-right: 10px"
                     :icon="MostlyCloudy"
                     @click="pushCloud"
                     round v-btn>云集
          </el-button>
          <el-badge :is-dot="showNotification">
            <el-button :icon="Bell" @click="notifyDrawer = true" circle v-btn/>
          </el-badge>&nbsp;&nbsp;&nbsp;
          <el-button :icon="Reading" circle v-btn @click="showUserCenter = true"/>
        </el-col>
      </el-row>
    </el-card>
  </tc-container-full-row>
  <router-view/>
  <el-drawer
      title="通知" direction="rtl" size="40%"
      :show-close="false"
      v-model="notifyDrawer"
  >
    <el-card style="border-radius: 10px;margin-top: -20px" shadow="never">
      <el-scrollbar>
        <div class="scrollbar-flex-content">
          <el-button :type="nowType === 0 ? 'primary' : ''" :color="nowType === 0 ? '#333333' : ''"
                     class="scrollbar-demo-item"
                     @click="nowType = 0"
                     round v-btn>全部
          </el-button>
          <el-button :type="nowType === 1 ? 'primary' : ''" :color="nowType === 1 ? '#333333' : ''"
                     class="scrollbar-demo-item"
                     @click="nowType = 1"
                     round v-btn>培训
          </el-button>
          <el-button :type="nowType === 2 ? 'primary' : ''" :color="nowType === 2 ? '#333333' : ''"
                     class="scrollbar-demo-item"
                     @click="nowType = 2"
                     round v-btn>考试
          </el-button>
          <el-button :type="nowType === 5 ? 'primary' : ''" :color="nowType === 5 ? '#333333' : ''"
                     class="scrollbar-demo-item"
                     @click="nowType = 5"
                     round v-btn>回复
          </el-button>
          <el-button :type="nowType === 6 ? 'primary' : ''" :color="nowType === 6 ? '#333333' : ''"
                     class="scrollbar-demo-item"
                     @click="nowType = 6"
                     round v-btn>其他
          </el-button>
          <el-button :type="nowType === 3 ? 'primary' : ''" :color="nowType === 3 ? '#333333' : ''"
                     class="scrollbar-demo-item"
                     @click="nowType = 3"
                     round v-btn>主评论
          </el-button>
          <el-button :type="nowType === 4 ? 'primary' : ''" :color="nowType === 4 ? '#333333' : ''"
                     class="scrollbar-demo-item"
                     @click="nowType = 4"
                     round v-btn>跟帖评论
          </el-button>
        </div>
        <br/>
      </el-scrollbar>
      <br/>
      <div v-loading="loading">
        <el-card style="margin-bottom: 10px; border-radius: 20px; user-select: none"
                 shadow="hover"
                 v-for="(item, index) in notificationList" :key="index">
          <el-row :gutter="15">
            <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
              <el-badge :is-dot="item['is_read'] === 0">
                <el-button size="large" :icon="notificationIconMap[item['notification_source_type']]"
                           @click="isRead(item['id'], item['is_read'])" circle v-btn/>
              </el-badge>
            </el-col>
            <el-col :xs="20" :sm="20" :md="20" :lg="20" :xl="20">
              <PlanNotification v-if="item['notification_source_type'] === 'plan'" :notification-body="item"/>
              <OtherNotification v-if="item['notification_source_type'] === 'message'" :notification-body="item"/>
              <ReplyNotification v-if="item['notification_source_type'] === 'reply'" :notification-body="item"/>
              <LikeFatherCommentNotification v-if="item['notification_source_type'] === 'father_like'"
                                             :notification-body="item"/>
              <LikeChildrenCommentNotification v-if="item['notification_source_type'] === 'children_like'"
                                               :notification-body="item"/>
              <TestNotification v-if="item['notification_source_type'] === 'test'" :notification-body="item"/>
            </el-col>
          </el-row>
        </el-card>
        <el-divider style="cursor: pointer" v-if="showViewMore && notificationList.length !== 0" @click="viewMore">
          查看更多
        </el-divider>
        <el-divider v-if="!showViewMore && notificationList.length !== 0">已加载全部</el-divider>
      </div>
    </el-card>
  </el-drawer>

  <user-center-dialog :dialog="showUserCenter" @click="closeUserCenter"/>
</template>

<style scoped>
.menu-logo {
  user-select: none;
  font-family: 微软雅黑, system-ui;
  font-weight: bolder;
  font-size: 1rem;
}

.scrollbar-flex-content {
  display: flex;
}

.scrollbar-demo-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>