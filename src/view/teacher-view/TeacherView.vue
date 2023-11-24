<script setup>
import websiteIcon from "@/assets/website_icon.png";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {Bell, GoldMedal, Reading} from "@element-plus/icons-vue";
import {onBeforeMount, ref} from "vue";
import {getPlanListByTeacherId} from "@/api/plan-api";
import {processProgress, selectPlanListSwitch} from "@/utils/dataUtil";
import {withLoading} from "@/utils/functionUtil";
import {getDeptInfo} from "@/api/dept-api";
import {getTeacherAndLessonProgress} from "@/api/progress-api";
import AddLessonDialog from "@/view/teacher-view/dialog/AddLessonDialog.vue";
import TeacherChapterManage from "@/view/teacher-view/TeacherChapterManage.vue";
import {useRouter} from "vue-router";

// 定义全局变量
const loading = ref(false)


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
const change = (val) => {
  console.log(val)
  console.log(planId.value)
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
const lessonList = ref()
const originLessonList = ref()
const activeLessonId = ref()
const activeLessonName = ref()
const activeProgress = ref()
const getLessonList = withLoading(async () => {
  const res = await getTeacherAndLessonProgress(planId.value, sessionStorage.getItem('uid'))
  if (res.code === 2002) {
    lessonList.value = processProgress(res.data.lesson_progress)
    originLessonList.value = lessonList.value
    // 初次载入时赋值选择的课程内容
    const {id, lesson_name, total_progress} = lessonList.value[0]
    setActiveValue(id, lesson_name, total_progress)
  }
}, loading)
// 当切换不同课程时
const whenChangeLesson = (element) => {
  const {id, lesson_name, total_progress} = lessonList.value[element]
  setActiveValue(id, lesson_name, total_progress)
  if (router.currentRoute.value.fullPath.includes('/teacher/exam/report')) {
    router.push({
      path:'/teacher/exam/report',
      query:{
        lessonId:id
      }
    })
  } else if (router.currentRoute.value.fullPath.includes('/teacher/exam')) {
    router.push({
      path:'/teacher/exam',
      query:{
        lessonId:id
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


// 获取当前路由
const router = useRouter()


// 生命周期钩子
onBeforeMount(async () => {
  // 加载培训计划选择器
  await getPlanIdList(sessionStorage.getItem("uid"))
  await getLessonList()
})
</script>

<template>
  <!--顶部tag栏-->
  <tc-container-full-row>
    <el-card shadow="never" :body-style="{paddingBottom:'15px',paddingTop:'15px'}" style="border-radius: 0">
      <el-row style="height: 5vh">
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <div style="display: flex;align-items: center;" @click="router.push('/teacher')">
            <img :src="websiteIcon" alt="404" style="width: 40px;height: 40px">
            <span class="menu-logo" style="margin-left: 5px">TrainingClient</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" align="right">
          <el-button :icon="GoldMedal" round v-btn @click="router.push({
          path:'/teacher/exam',
          query:{lessonId:activeLessonId}
          })">考核评估</el-button>&nbsp;&nbsp;
          <el-badge :value="12">
            <el-button :icon="Bell" circle v-btn/>
          </el-badge>&nbsp;&nbsp;&nbsp;
          <el-button :icon="Reading" circle v-btn/>
        </el-col>
      </el-row>
    </el-card>
  </tc-container-full-row>
  <router-view v-if="!router.currentRoute.value.path.includes('/teacher/exam')"/>

  <!-- 中央内容区 -->
  <tc-container-full-row v-loading="loading"
                         v-show="!router.currentRoute.value.path.includes('/teacher/edit')">
    <el-row>
      <!-- 左侧 -->
      <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
        <el-card shadow="never" style="height: 95vh;border-top: none;border-radius: 0;overflow-y: auto">
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

          <!-- 新增课程 -->
          <el-row>
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12"
                    style="display: flex; align-items: center;" align="left">
              <span>课程列表</span>
            </el-col>
            <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" align="right"
                    style="display: flex; align-items: center; justify-content: flex-end;">
              <el-button color="#333333" @click="showAddLessonDialog = true" v-btn>新课程</el-button>
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
              default-active="0"
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
      <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18" >
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

  <!-- 对话框区 -->
  <AddLessonDialog :show-add-lesson-dialog="showAddLessonDialog"
                   :plan-id="planId"
                   @close-add-lesson-dialog="closeAddLessonDialog"/>

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

.lesson_link {
  color: #333333;
  font-size: 1rem;
}

.lesson_link_active {
  color: #000000;
  font-size: 1.5rem;
  font-weight: bolder;
}

#lesson-list{
  border-right: none;
}
#lesson-list .el-menu-item.is-active{
  background-color: #f7f7f8;
  border-radius: 5px;
}
#lesson-list .el-menu-item:hover{
  background-color: transparent;
  color: #333333;
}
</style>