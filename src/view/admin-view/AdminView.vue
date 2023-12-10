<script setup>
import TcCardCenterContent from "@/components/card/tc-card-center-content.vue";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {User,Suitcase,Files,Bell,Reading,Tickets} from '@element-plus/icons-vue'
import TcCard from "@/components/card/tc-card.vue";
import {useRoute} from "vue-router";
import {computed, onBeforeMount, ref, watch} from "vue";
import websiteIcon from "@/assets/website_icon.png"
import UserCenterDialog from "@/components/dialog/UserCenterDialog.vue";
import {notificationIconMap} from "@/utils/notificationUtil";
import OtherNotification from "@/components/notification/OtherNotification.vue";
import PlanNotification from "@/components/notification/PlanNotification.vue";
import TestNotification from "@/components/notification/TestNotification.vue";
import {getAllNotificationList, getOtherTypeNotificationList, getPushClient, isReadNotification} from "@/api/push-api";
import {useNotificationStore} from "@/store/store";
import AddCustomNotificationDialog from "@/view/admin-view/dialog/AddCustomNotificationDialog.vue";

const route = useRoute()
const breadList = [
  {
    path:'/admin/user',
    name:'用户管理'
  },
  {
    path:'/admin/dept',
    name:'部门管理'
  },
  {
    path:'/admin/resource',
    name:'资源管理'
  },
  {
    path: '/admin/plan',
    name: '培训计划'
  }
]
const activeList = [
  {
    path:'/admin/user',
    name:'user'
  },
  {
    path:'/admin/dept',
    name:'dept'
  },
  {
    path:'/admin/resource',
    name:'resource'
  },
  {
    path: '/admin/plan',
    name: 'plan'
  }
]
const breadName = computed(() => breadList.find(item => item.path === route.path).name)
const defaultActive = computed(() => activeList.find(item => item.path === route.path).name)

const showUserCenter = ref(false)
const closeUserCenter = (des) => {
  if (des){
    showUserCenter.value = false
  }
}


// 通知
const notificationStore = useNotificationStore()
const notificationState = computed(() => notificationStore.showNotification)
const notifyDrawer = ref(false)
const notificationList = ref([])
const showViewMore = ref(true)
const showNotification = ref(false)
const notificationLoading = ref(false)
const loadingAllNotification = async (offset) => {
  notificationLoading.value = true
  const res = await getAllNotificationList(sessionStorage.getItem("uid"), 6, offset)
  if (res.code === 2002 && res.total !== 0) {
    notificationList.value.push(...res.data)
    showNotification.value = !notificationList.value.every(item => item['is_read'] === 1);
    showViewMore.value = res.total !== notificationList.value.length;
  }
  notificationLoading.value = false
}
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
const loadingOtherTypeNotificationList = async (offset) => {
  notificationLoading.value = true
  const res = await getOtherTypeNotificationList(sessionStorage.getItem("uid"), nowType.value, offset)
  if (res.code === 2002 && res.total !== 0) {
    notificationList.value.push(...res.data)
    showViewMore.value = res.total !== notificationList.value.length;
  }
  notificationLoading.value = false
}

const showCustomNotification = ref(false)
const closeCustomNotification = (des) => {
  if (des){
    showCustomNotification.value = false
  }
}

onBeforeMount(async () => {
  getPushClient()
  await loadingAllNotification(0)
})
</script>

<template>
  <!--  左右两段式布局-->
  <el-row>
    <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
      <!--      左侧菜单栏  -->
      <tc-card-center-content class="menu-card">
        <tc-container-full-row >
          <div style="display: flex;align-items: center;">
            <img :src="websiteIcon" alt="404" style="width: 40px;height: 40px">
            <span class="menu-logo" style="margin-left: 5px">TrainingClient</span>
          </div>
        </tc-container-full-row><br/>
<!--        tab标签栏-->
        <tc-container-full-row>
          <el-menu
              :default-active=defaultActive
              router
          >
            <el-menu-item index="user">
              <el-icon><User/></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>
            <el-menu-item index="dept">
              <el-icon><Suitcase /></el-icon>
              <template #title>部门管理</template>
            </el-menu-item>
            <el-menu-item index="resource">
              <el-icon><Files /></el-icon>
              <template #title>资源管理</template>
            </el-menu-item>
            <el-menu-item index="plan">
              <el-icon><Tickets /></el-icon>
              <template #title>培训计划</template>
            </el-menu-item>
          </el-menu>
        </tc-container-full-row>
      </tc-card-center-content>
    </el-col>
    <el-col :xs="20" :sm="20" :md="20" :lg="20" :xl="20">
      <tc-card class="container-card">
        <el-row style="height: 5vh">
<!--          顶部面包屑-->
          <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>{{breadName}}</el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
          <el-col :xs="20" :sm="20" :md="20" :lg="20" :xl="20" align="right">
            <el-badge :is-dot="showNotification">
              <el-button :icon="Bell" @click="notifyDrawer = true" circle v-btn/>
            </el-badge>&nbsp;&nbsp;&nbsp;
            <el-button :icon="Reading" circle v-btn @click="showUserCenter = true"/>
          </el-col>
        </el-row>
<!--        子路由-->
        <router-view/>
      </tc-card>
    </el-col>
  </el-row>

  <user-center-dialog :dialog="showUserCenter" @click="closeUserCenter"/>

  <AddCustomNotificationDialog :dialog="showCustomNotification"
                               @click="closeCustomNotification"/>

  <!--    通知面板-->
  <el-drawer
      direction="rtl" size="40%"
      :show-close="false"
      v-model="notifyDrawer"
  >
    <template #header>
      <el-row style="display: flex; align-items: center;">
        <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18">
          <h3 style="margin-top: 0;margin-bottom: 0">通知</h3>
        </el-col>
        <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right;">
          <el-button type="primary" @click="showCustomNotification = true" text>推送自定义通知</el-button>
        </el-col>
      </el-row>
    </template>
    <el-card style="border-radius: 10px;margin-top: -20px" shadow="never">
      <el-scrollbar>
        <div class="scrollbar-flex-content">
          <el-button :type="nowType === 0 ? 'primary' : ''" :color="nowType === 0 ? '#333333' : ''"
                     class="scrollbar-demo-item"
                     @click="nowType = 0"
                     round v-btn>全部
          </el-button>
        </div>
        <br/>
      </el-scrollbar>
      <br/>
      <div v-loading="notificationLoading">
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
</template>

<style scoped src="@/css/admin-view.css" />