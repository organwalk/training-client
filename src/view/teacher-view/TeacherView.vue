<script setup>
import websiteIcon from "@/assets/website_icon.png";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {Bell, GoldMedal, Reading} from "@element-plus/icons-vue";
import {computed, onBeforeMount, ref, watch} from "vue";
import {getPlanListByTeacherId} from "@/api/plan-api";
import {processProgress, selectPlanListSwitch} from "@/utils/dataUtil";
import {withLoading} from "@/utils/functionUtil";
import {getDeptInfo} from "@/api/dept-api";
import {getTeacherAndLessonProgress} from "@/api/progress-api";
import AddLessonDialog from "@/view/teacher-view/dialog/AddLessonDialog.vue";
import TeacherChapterManage from "@/view/teacher-view/TeacherChapterManage.vue";
import {useRouter} from "vue-router";
import {notificationIconMap} from "@/utils/notificationUtil";
import OtherNotification from "@/components/notification/OtherNotification.vue";
import PlanNotification from "@/components/notification/PlanNotification.vue";
import TestNotification from "@/components/notification/TestNotification.vue";
import {getAllNotificationList, getOtherTypeNotificationList, getPushClient, isReadNotification} from "@/api/push-api";
import {useNotificationStore} from "@/store/store";
import AddCustomNotificationDialog from "@/view/teacher-view/dialog/AddCustomNotificationDialog.vue";
import UserCenterDialog from "@/components/dialog/UserCenterDialog.vue";

// 定义全局变量
const loading = ref(false)
// 获取当前路由
const router = useRouter()


// 控制培训计划选择器
const planId = ref('')
const originPlanList = ref([])
const planIdList = ref([])
const getPlanIdList = withLoading(async (teacherId) => {
  const res = await getPlanListByTeacherId(teacherId)
  if (res.code === 2002) {
    // 将培训计划列表转化成选择器模式
    originPlanList.value = res.data
    planIdList.value = selectPlanListSwitch(res.data)
    planId.value = planIdList.value.find(item => {
      // 选择 正在进行 状态的第一个值为默认值
      if (item['label'] === "正在进行") {
        return item
      } else {
        return planIdList.value[0]
      }
    })['options'][0].value
  } else {
    // 当无法获取培训计划列表时...
  }
}, loading)

// 渲染培训计划细节
const planDetailHTML = ref(new Map())
const getPlanDetailHTML = async (id) => {
  // 当细节缓存中不存在时，进行渲染
  if (!planDetailHTML.value.get(id)) {
    planDetailHTML.value.set(id, '······')
    // 从原始计划列表中获取与聚焦事件相对应的对象
    let obj = originPlanList.value.find(item => {
      if (item['id'] === Number(id)) {
        return item
      }
    })
    // 获取部门名称、渲染HTML模板并缓存入map结构中
    const res = await getDeptInfo(obj['dept_id'])
    obj.deptName = res.data.deptName
    const html = `<strong>培训目的：</strong><p>${obj['training_purpose']}</p><br/><br/>` +
        `<strong>开始时间：</strong>${obj['training_start_time']}<br/>` +
        `<strong>结束时间：</strong>${obj['training_end_time']}<br/>` +
        `<strong>培训部门：</strong>${obj['deptName']}`
    planDetailHTML.value.set(id, html)
  }
}
const change = async (val) => {
  planId.value = val
  await getLessonList()
}


// 搜索课程
const lessonName = ref('')
const searchLesson = (keyword) => {
  // 当关键词存在时，从原始课程列表中进行模糊查询，并赋值给展示列表
  if (keyword) {
    lessonList.value = originLessonList.value.filter(item => {
      return item.lesson_name.toLowerCase().includes(keyword.toLowerCase());
    })
  } else {
    // 当关键词不存在时，直接将原始课程列表赋值给展示列表
    lessonList.value = originLessonList.value
  }
}


// 获取课程列表
const lessonList = ref([])
const originLessonList = ref()
const activeLessonId = ref()
const activeLessonName = ref()
const activeProgress = ref()
const nowLessonIndex = ref('0')
const getLessonList = withLoading(async () => {
  const res = await getTeacherAndLessonProgress(planId.value, sessionStorage.getItem('uid'))
  if (res.code === 2002) {
    lessonList.value = processProgress(res.data.lesson_progress)
    originLessonList.value = lessonList.value
    // 初次载入时赋值选择的课程内容
    let id, lesson_name, total_progress
    if (router.currentRoute.value.query.lessonId){
      let obj = lessonList.value.find(item => {
        return item["id"] === Number(router.currentRoute.value.query.lessonId)
      });
      id = obj['id']
      lesson_name = obj['lesson_name']
      total_progress = obj['total_progress']
      nowLessonIndex.value = String(lessonList.value.findIndex(item => item["id"] === Number(router.currentRoute.value.query.lessonId)))
    }else {
      id = lessonList.value[0].id
      lesson_name = lessonList.value[0].lesson_name
      total_progress = lessonList.value[0].total_progress
    }
    setActiveValue(id, lesson_name, total_progress)
  }
}, loading)

const whenChangeLesson = (element) => {
  const {id, lesson_name, total_progress} = lessonList.value[element]
  setActiveValue(id, lesson_name, total_progress)
  pushRoute(id)
}
const pushRoute = (id) => {
  if (router.currentRoute.value.fullPath.includes('/teacher/exam/report')) {
    router.push({
      path: '/teacher/exam/report',
      query: {
        lessonId: id
      }
    })
  } else if (router.currentRoute.value.fullPath.includes('/teacher/exam')) {
    router.push({
      path: '/teacher/exam',
      query: {
        lessonId: id
      }
    })
  }
}
const setActiveValue = (id, lesson_name, total_progress) => {
  activeLessonId.value = id
  activeLessonName.value = lesson_name
  activeProgress.value = total_progress
}


// 添加新课程对话框控制
const showAddLessonDialog = ref(false)
const closeAddLessonDialog = async (des) => {
  showAddLessonDialog.value = false
  // 重新触发课程列表刷新
  if (des.split('-')[0] !== 'cancel') {
    await getLessonList()
  }
}


// 刷新页面数据
const refreshData = async (state) => {
  if (state) await getLessonList()
}


const examAndReport = () => {
  router.push({
    path: '/teacher/exam',
    query: {lessonId: activeLessonId.value}
  })
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

const showUserCenter = ref(false)
const closeUserCenter = (des) => {
  if (des){
    showUserCenter.value = false
  }
}

// 生命周期钩子
onBeforeMount(async () => {
  // 加载培训计划选择器
  await getPlanIdList(sessionStorage.getItem("uid"))
  await getLessonList()
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
          <div style="display: flex;align-items: center;" @click="router.push('/teacher')">
            <img :src="websiteIcon" alt="404" style="width: 40px;height: 40px">
            <span class="menu-logo" style="margin-left: 5px">TrainingClient</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" align="right">
          <el-button :icon="GoldMedal" round v-btn @click="examAndReport">考核评估</el-button>&nbsp;&nbsp;
          <el-badge :is-dot="showNotification">
            <el-button :icon="Bell" @click="notifyDrawer = true" circle v-btn/>
          </el-badge>&nbsp;&nbsp;&nbsp;
          <el-button :icon="Reading" @click="showUserCenter = true" circle v-btn/>
        </el-col>
      </el-row>
    </el-card>
  </tc-container-full-row>
  <el-progress :percentage="50" color="#333" :duration="1" :indeterminate="true" :show-text="false" v-if="loading"/>
  <div v-show="!loading">
    <router-view v-if="!router.currentRoute.value.path.includes('/teacher/exam')"/>
    <!-- 中央内容区 -->
    <tc-container-full-row v-loading="loading"
                           v-if="!router.currentRoute.value.path.includes('/teacher/edit')
                         && !router.currentRoute.value.path.includes('/teacher/test_paper')">
      <el-row>
        <!-- 左侧 -->
        <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
          <el-card shadow="never"
                   style="height: 95vh;border-top: none;border-bottom: none;border-radius: 0;overflow-y: auto">
            <div v-if="!router.currentRoute.value.query.lessonId">
              <tc-container-full-row>
                <!-- 培训计划选择器 -->
                <el-select v-model="planId" @change="change">
                  <el-option-group v-for="group in planIdList" :key="group.label" :label="group.label">
                    <el-option
                        v-for="item in group.options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    >
                      <el-tooltip
                          class="box-item"
                          effect="light"
                          placement="right-start"
                          :hide-after="0"
                          :offset="50"
                          :show-arrow="false"
                      >
                        <template #content>
                          <div style="width: 200px" v-html="planDetailHTML.get(item.value)"/>
                        </template>
                        <div style="width: 100%" @mouseover="getPlanDetailHTML(item.value)"><span>{{ item.label }}</span>
                        </div>
                      </el-tooltip>
                    </el-option>
                  </el-option-group>
                </el-select>
              </tc-container-full-row>
              <br/>
            </div>


            <!-- 新增课程 -->
            <el-row>
              <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12"
                      style="display: flex; align-items: center;" align="left">
                <span>课程列表</span>
              </el-col>
              <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" align="right"
                      style="display: flex; align-items: center; justify-content: flex-end;">
                <el-button color="#333333" @click="showAddLessonDialog = true" v-if="!router.currentRoute.value.query.lessonId" v-btn>新课程</el-button>
              </el-col>
            </el-row>
            <br/>

            <!-- 搜索课程 -->
            <tc-container-full-row>
              <el-input v-model="lessonName"
                        @input="searchLesson"
                        placeholder="查找课程..."
                        class="search-lesson"
                        id="search-lesson"/>
            </tc-container-full-row>
            <br/>

            <!-- 课程列表 -->
            <el-menu
                id="lesson-list"
                :default-active="nowLessonIndex"
                text-color="#A8ABB2"
                active-text-color="#000000"
                @select="whenChangeLesson"
            >
              <el-menu-item v-for="(item, index) in lessonList" :key="item" :index="String(index)">
                <span>{{ item.lesson_name }}</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>
        <!-- 中间 -->
        <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18">
          <TeacherChapterManage v-if="!router.currentRoute.value.path.includes('/teacher/exam')"
                                :lesson-obj="{
          lesson_name:activeLessonName,
          lesson_id:activeLessonId,
          lesson_progress:activeProgress
        }" @refresh-data="refreshData"/>
          <router-view/>
        </el-col>
      </el-row>
    </tc-container-full-row>


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
            <el-button :type="nowType === 6 ? 'primary' : ''" :color="nowType === 6 ? '#333333' : ''"
                       class="scrollbar-demo-item"
                       @click="nowType = 6"
                       round v-btn>其他
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
  </div>


  <!-- 对话框区 -->
  <AddLessonDialog :show-add-lesson-dialog="showAddLessonDialog"
                   :plan-id="planId"
                   @close-add-lesson-dialog="closeAddLessonDialog"/>

  <AddCustomNotificationDialog :dialog="showCustomNotification"
                               :plan-list="originPlanList"
                               @click="closeCustomNotification"/>
  <user-center-dialog :dialog="showUserCenter" @click="closeUserCenter"/>


</template>

<style scoped>
/*noinspection CssUnusedSymbol*/
/deep/ .el-input__wrapper {
  box-shadow: none;
  padding: 0
}

/*noinspection CssUnusedSymbol*/
/deep/ .el-textarea__inner {
  resize: none;
}

/*noinspection CssUnusedSymbol*/
/deep/ .el-select:hover:not(.el-select--disabled) .el-input__wrapper {
  box-shadow: none;
}

/*noinspection CssUnusedSymbol*/
/deep/ .el-select {
  --el-select-border-color-hover: none;
  --el-select-input-focus-border-color: none;
}

/deep/ #search-lesson {
  padding-left: 15px;
  padding-right: 15px;
  border-radius: 5px;
  background-color: #f1f2f3;
}


.menu-logo {
  user-select: none;
  font-family: 微软雅黑, system-ui;
  font-weight: bolder;
  font-size: 1rem;
}

/*noinspection CssUnusedSymbol*/
.lesson_link {
  color: #333333;
  font-size: 1rem;
}

/*noinspection CssUnusedSymbol*/
.lesson_link_active {
  color: #000000;
  font-size: 1.5rem;
  font-weight: bolder;
}

#lesson-list {
  border-right: none;
}

/*noinspection CssUnusedSymbol*/
#lesson-list .el-menu-item.is-active {
  background-color: #f7f7f8;
  border-radius: 5px;
}

/*noinspection CssUnusedSymbol*/
#lesson-list .el-menu-item:hover {
  background-color: transparent;
  color: #333333;
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