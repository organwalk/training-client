<script setup>
import websiteIcon from "@/assets/website_icon.png";
import {Bell, MostlyCloudy, Reading} from "@element-plus/icons-vue";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {useRouter} from "vue-router";
import {computed, onBeforeMount, ref} from "vue";
import {useDeptStore} from "@/store/store";
import {ElMessage} from "element-plus";
import {getAllNotificationList, isReadNotification} from "@/api/push-api";
import {notificationIconMap} from "@/utils/notificationUtil";
import PlanNotification from "@/components/notification/PlanNotification.vue";
import OtherNotification from "@/components/notification/OtherNotification.vue";
import ReplyNotification from "@/components/notification/ReplyNotification.vue";
import LikeFatherCommentNotification from "@/components/notification/LikeFatherCommentNotification.vue";
import LikeChildrenCommentNotification from "@/components/notification/LikeChildrenCommentNotification.vue";
import TestNotification from "@/components/notification/TestNotification.vue";

const store = useDeptStore()
const deptId = computed(() => store.deptId)
const router = useRouter()

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
const loadingAllNotification = async (offset) => {
  const res = await getAllNotificationList(sessionStorage.getItem("uid"), 6, offset)
  if (res.code === 2002 && res.total !== 0) {
    showNotification.value = true
    notificationList.value.push(...res.data)
    if (res.total === notificationList.value.length){
      showViewMore.value = false
    }
  }
}
const nowType = ref(0)


// 查看更多通知
const offset = ref(1)
const viewMore = async () => {
  offset.value += 1
  const realOffset = ((offset.value) - 1) * 6
  await loadingAllNotification(realOffset)
}

// 将通知消息标记为已读
const isRead = async (nid, readState) => {
  if (readState === 0){
    const res = await isReadNotification(sessionStorage.getItem("uid"), nid)
    if (res.code === 2002){
      notificationList.value.forEach(item => {
        if (item['id'] === nid){
          item['is_read'] = 1
        }
      })
      if(notificationList.value.every(item => item['is_read'] === 1)){
        showNotification.value = false
      }
    }
  }
}


onBeforeMount(async () => {
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
          <el-button :icon="Reading" circle v-btn/>
        </el-col>
      </el-row>
    </el-card>
  </tc-container-full-row>
  <router-view/>
  <el-drawer
      title="通知" direction="rtl"
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
            <LikeFatherCommentNotification v-if="item['notification_source_type'] === 'father_like'" :notification-body="item"/>
            <LikeChildrenCommentNotification v-if="item['notification_source_type'] === 'children_like'" :notification-body="item"/>
            <TestNotification v-if="item['notification_source_type'] === 'test'" :notification-body="item"/>
          </el-col>
        </el-row>
      </el-card>
      <el-divider style="cursor: pointer" v-if="showViewMore && notificationList.length !== 0" @click="viewMore">查看更多</el-divider>
      <el-divider v-if="!showViewMore && notificationList.length !== 0">已加载全部</el-divider>
    </el-card>
  </el-drawer>
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