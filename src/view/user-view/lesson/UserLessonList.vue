<script setup>
import {onBeforeMount, ref} from "vue";
import {withLoading} from "@/utils/functionUtil";
import {getLessonListByPlanId, getStudentAllPlanList} from "@/api/learn-api";
import {useRouter} from "vue-router";
import {useDeptStore} from "@/store/store";

const loading = ref(false)

// 获取培训计划列表
const planList = ref([])
const planIndex = ref(0)
const planPresent = ref(0)
const planPurpose = ref('')
const planStart = ref('')
const planEnd = ref('')
const planId = ref()
const store = useDeptStore()
const loadingPlanList = withLoading(async () => {
  const res = await getStudentAllPlanList(sessionStorage.getItem("uid"))
  if (res.code === 2002) {
    planList.value = res.data
    sessionStorage.setItem("dept_id", planList.value[planIndex.value]['dept_id']);
    store.setDeptId(planList.value[planIndex.value]['dept_id'])
    planPurpose.value = planList.value[planIndex.value]['training_purpose']
    planStart.value = planList.value[planIndex.value]['training_start_time']
    planEnd.value = planList.value[planIndex.value]['training_end_time']
    planId.value = planList.value[planIndex.value]['id']
    planPresent.value = planList.value[planIndex.value]['present'] * 100 % 100
  }
}, loading)

const whenChangePlan = (val) => {
  console.log(val)
}


// 获取培训计划下的课程列表
const lessonList = ref([])
const loadingLessonList = withLoading(async () => {
  const res = await getLessonListByPlanId(planId.value, sessionStorage.getItem("uid"))
  if (res.code === 2002){
    lessonList.value = res.data
  }
}, loading)

// 查看章节列表
const router = useRouter()
const entryChapter = (lessonId) => {
  router.push({
    path:'/user/chapter',
    query:{
      lessonId:lessonId
    }
  })
}


// 生命周期钩子
onBeforeMount(async () => {
  await loadingPlanList()
  await loadingLessonList()
})
</script>

<template>
  <el-progress :percentage="50" color="#333" :duration="4" :indeterminate="true" :show-text="false" v-if="loading"/>
  <el-row style="height: 90vh" v-if="!loading">
    <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
      <el-card shadow="never"
               style="border-radius: 0; height: 90vh;border-top: none;border-left: none;border-bottom: none;overflow-y: auto">
        <!-- 课程列表 -->
        <el-menu
            id="lesson-list"
            default-active="0"
            text-color="#A8ABB2"
            active-text-color="#000000"
            @select="whenChangePlan"
        >
          <el-menu-item v-for="(item, index) in planList" :key="item" :index="String(index)">
            <span>{{ item.training_title }}</span>
          </el-menu-item>
        </el-menu>
      </el-card>
    </el-col>
    <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18">
      <el-row>
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <el-card shadow="never"
                   style="height: 90vh;
                   font-family: 微软雅黑,serif;
                   border-top: none;border-left: none;border-bottom: none;overflow-y: auto">
            <el-row :gutter="15">
              <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                <el-card shadow="hover" style="border-radius: 15px;background-color: #333;color: #ffffff">
                  <h1 style="margin-top: 0;margin-bottom: 0">欢迎回来！</h1><br/>
                  <span style="font-weight: lighter;font-size: 0.8rem">{{ planPurpose }}</span>
                </el-card>
              </el-col>
              <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                <el-card shadow="hover" style="border-radius: 15px;">
                  <h3 style="margin-top: 0;margin-bottom: 0">
                    培训开始时间：
                    <el-text type="primary">{{ planStart }} 至
                      {{ planEnd }}
                    </el-text>
                  </h3>
                </el-card><br/>
                <el-card shadow="hover" style="border-radius: 15px;">
                  <el-text type="info">当前完成进度：</el-text>
                  <el-progress :percentage="planPresent"/>
                </el-card>
              </el-col>
            </el-row>
            <br/>
            <el-row :gutter="20">
              <el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8" v-for="(item,index) in lessonList" :key="index">
                <el-card shadow="hover" style="border-radius: 15px;color: #333">
                  <h4 style="margin-top: 0;margin-bottom: 5px">{{ item.lessonName }}</h4>
                  <el-row style="margin-bottom: 10px">
                    <el-tag style="margin-right: 5px" :type="item['lessonState'] === '1' ? 'success' : 'info'" size="small">
                      {{ item['lessonState'] === '1' ? '已发布' : '未发布'}}
                    </el-tag>
                    <el-tag style="margin-right: 5px" type="warning" size="small">{{ item['teacherInfo']['realName'] }}</el-tag>
                    <el-tag type="info" size="small">{{ item['teacherInfo']['mobile'] }}</el-tag>
                  </el-row>
                  <el-text style="font-weight: lighter;font-size: 0.8rem" line-clamp="3">{{ item['lessonDes'] }}</el-text>
                  <el-row style="margin-top: 10px;display: flex;align-items: center">
                    <el-col :xs="8" :sm="8" :md="8" :lg="18" :xl="8">
                      <el-progress :percentage="item['present'] * 100 % 100" :show-text="false"/>
                    </el-col>
                    <el-col :xs="8" :sm="8" :md="8" :lg="6" :xl="8" align="right">
                      <el-button text size="small" type="primary"
                                 @click="entryChapter(item.id)"
                                 :disabled="item['lessonState'] === '0'">学习 →</el-button>
                    </el-col>
                  </el-row>
                </el-card><br/>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<style scoped>
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
</style>