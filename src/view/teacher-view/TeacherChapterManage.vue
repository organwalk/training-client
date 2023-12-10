<script setup>
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {defineProps, defineEmits, reactive, ref, computed, watchEffect} from "vue";
import {More, Plus, Switch} from '@element-plus/icons-vue'
import UpdateLessonDialog from "@/view/teacher-view/dialog/UpdateLessonDialog.vue";
import TeacherChapterList from "@/view/teacher-view/TeacherChapterList.vue";
import AddChapterDialog from "@/view/teacher-view/dialog/AddChapterDialog.vue";
import {getLessonDetail, startLesson} from "@/api/plan-api";
import {ElMessage} from "element-plus";
import {withLoading} from "@/utils/functionUtil";
import StudentProgressList from "@/view/teacher-view/StudentProgressList.vue";
import StudentRankingList from "@/view/teacher-view/StudentRankingList.vue";
import GetStudentRankingListDialog from "@/view/teacher-view/dialog/GetStudentRankingListDialog.vue";


// 定义全局变量
const loading = ref(false)
const props = defineProps({
  lessonObj: Object
})
const emit = defineEmits(['refreshData'])



// 章节搜索相关
const chapterName = ref()
const keyword = computed(() => chapterName.value)


// 更多操作相关
const operateObj = reactive([
  {
    text: "<div style='display: flex;align-items: center'><svg style='width: 15px;height: 15px' viewBox=\"0 0 1024 1024\" xmlns=\"http://www.w3.org/2000/svg\" data-v-ea893728=\"\"><path fill=\"currentColor\" d=\"M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768zm0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896z\"></path><path fill=\"currentColor\" d=\"M745.344 361.344a32 32 0 0 1 45.312 45.312l-288 288a32 32 0 0 1-45.312 0l-160-160a32 32 0 1 1 45.312-45.312L480 626.752l265.344-265.408z\"></path></svg>" +
        "<span style='font-size: 1rem;font-weight: bolder;margin-left: 5px'>发布课程</span></div><span style='font-size: 0.8rem'>当课程至少有一个章节时，可以发布课程</span>"
  },
  {
    text: "<div style='display: flex;align-items: center'><svg style='width: 15px;height: 15px' viewBox=\"0 0 1024 1024\" xmlns=\"http://www.w3.org/2000/svg\" data-v-ea893728=\"\"><path d=\"m199.04 672.64 193.984 112 224-387.968-193.92-112-224 388.032zm-23.872 60.16 32.896 148.288 144.896-45.696L175.168 732.8zM455.04 229.248l193.92 112 56.704-98.112-193.984-112-56.64 98.112zM104.32 708.8l384-665.024 304.768 175.936L409.152 884.8h.064l-248.448 78.336L104.32 708.8zm384 254.272v-64h448v64h-448z\" fill=\"currentColor\"></path></svg>" +
        "<span style='font-size: 1rem;font-weight: bolder;margin-left: 5px'>编辑课程</span></div><span style='font-size: 0.8rem'>编辑课程的标题和描述</span>"
  }
])
const showUpdateLessonDialog = ref(false)
const showDeleteLessonDialog = ref(false)
const getOperate = async (val) => {
  if (val.includes('编辑课程')) {
    showUpdateLessonDialog.value = true;
  } else if (val.includes('删除课程')) {
    showDeleteLessonDialog.value = true;
  } else if (val.includes('发布课程')){
    if (nowState.value === '已发布'){
      ElMessage.info({
        grouping:true,
        message:'当前课程已发布'
      })
    }else {
      await startTheLesson()
    }
  }
}


// 关闭对话框
const closeUpdateDialog = (des) => {
  showUpdateLessonDialog.value = false
  if (des.split('-')[0] !== 'cancel'){
    emit('refreshData', true)
  }
}


// 添加章节
const showAddChapterDialog = ref(false)
const isRefresh = ref(false)
const closeAddChapterDialog = (des) => {
  showAddChapterDialog.value = false
  if (des.split('-')[0] !== 'cancel'){
    emit('refreshData', true)
    isRefresh.value = true
  }
}


// 将课程设为发布
const startTheLesson = withLoading(async () => {
  const res = await startLesson(props.lessonObj.lesson_id)
  if (res.code === 2002){
    ElMessage.success(res.msg)
  }
}, loading)

// 获取当前课程发布状态
const nowState = ref('···')
const type = ref('info')
const getLessonState = async () => {
  const res = await getLessonDetail(props.lessonObj.lesson_id)
  if (res.code === 2002){
    if (res.data['lesson_state'] === 0){
      nowState.value = "未发布"
    }else {
      nowState.value = "已发布"
      type.value = "success"
    }
  }else {
    nowState.value = "未知"
  }
}


// 监听器
const lessonId = computed(() => props.lessonObj.lesson_id)
watchEffect(async () => {
  if (lessonId.value){
    await getLessonState()
  }
})

//查看学生进度排行榜
const showStudentRankingListDialog = ref(false)





// 操作方法
const isReverse = ref(1)
</script>

<template>
  <el-card shadow="never" style="height: 95vh;border-top: none;border-radius: 0;overflow-y: auto;" v-loading="loading">
    <el-row :gutter="20">
      <!-- 左侧 -->
      <el-col :xs="14" :sm="14" :md="14" :lg="15" :xl="14">
        <!-- 课程操作栏-->
        <tc-container-full-row>
          <el-row>
            <!-- 课程名 -->
            <el-col :xs="6" :sm="6" :md="6" :lg="3" :xl="6">
              <el-tag :type="type === 'success' ? 'success':'info'">{{ nowState }}</el-tag>
            </el-col>
            <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
              <h3 style="margin-top: 0;margin-bottom: 0">{{ props.lessonObj.lesson_name }}</h3>
            </el-col>

            <!-- 搜索栏及更多操作 -->
            <el-col :xs="18" :sm="18" :md="18" :lg="15" :xl="18" align="right">
              <el-input v-model="chapterName"
                        placeholder="搜索指定章节"
                        style="width: 40%"
                        id="search-lesson"/>
              <el-popover
                  id="more-operate"
                  placement="bottom"
                  :width="350"
                  trigger="click"
                  :show-arrow="false"
                  :hide-after="0"
                  :offset="-5"
                  popper-class="operate-pop"
              >
                <el-card :body-style="{padding:0}">
                  <template #header>
                    <span style="font-weight: bold">更多操作</span>
                  </template>
                  <el-table :data="operateObj" :show-header="false">
                    <el-table-column>
                      <template v-slot="{ row }">
                        <div style="user-select: none;cursor: pointer;" v-html="row.text" @click="getOperate(row.text)"></div>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>
                <template #reference>
                  <el-button :icon="More" style="margin-left: 10px;border: 1px solid #dadcdf" color="#f6f8fa"/>
                </template>
              </el-popover>
            </el-col>
          </el-row>
        </tc-container-full-row>
        <br/>

        <!-- 当前课程进度 -->
        <tc-container-full-row>
          <el-progress :percentage="(props.lessonObj.lesson_progress)"/>
        </tc-container-full-row>
        <br/>

        <!-- 章节操作栏 -->
        <el-row>
          <!-- 章节列表 -->
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
            <h4 style="margin-top: 0;margin-bottom: 0">章节列表</h4>
          </el-col>
          <!-- 增加章节 -->
          <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18" align="right">
            <el-button :icon="Switch"
                       @click="isReverse ++"
                       style="width: 20px;border: 1px solid #dadcdf" color="#f6f8fa"/>
            <el-button :icon="Plus"
                       @click="showAddChapterDialog = true"
                       style="margin-left: 10px;border: 1px solid #dadcdf" color="#f6f8fa">新章节</el-button>
          </el-col>
        </el-row><br/>

        <!-- 章节列表 -->
        <TeacherChapterList :lesson-id="lessonObj['lesson_id']"
                            :is-refresh="isRefresh"
                            :is-reverse="isReverse"
                            :keyword="keyword"/>

      </el-col>


      <!-- 右侧 -->
      <el-col :xs="9" :sm="9" :md="9" :lg="9" :xl="9">
        <el-card style="user-select: none" shadow="never">
          <template #header>
            <div class="card-header">
              <el-row style="display: flex; align-items: center;">
                <h3 style="margin-top: 0;margin-bottom: 0">学员进度时间线</h3>
              </el-row>
            </div>
          </template>
          <StudentProgressList :lesson-id="props.lessonObj.lesson_id"/>
        </el-card><br/>
<!--        <GetStudentProgressListDialog :lesson-id="props.lessonObj.lesson_id"-->
<!--                                      :show-student-progress-list-dialog = "showStudentProgressListDialog"-->
<!--                                      @close-student-progress-list-dialog = "args => showStudentProgressListDialog = args"-->
<!--                                      />-->

        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <el-row style="display: flex; align-items: center;">
                <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18">
                  <h3 style="margin-top: 0;margin-bottom: 0">进度排行榜</h3>
                </el-col>
                <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right;">
                  <el-button type="primary"
                             @click="showStudentRankingListDialog = true"
                             text>
                    查看全部
                  </el-button>
                </el-col>
              </el-row>
            </div>
          </template>
          <StudentRankingList :lesson-id="props.lessonObj.lesson_id"/>
        </el-card>

        <GetStudentRankingListDialog :lesson-id="props.lessonObj.lesson_id"
                                     :show-student-ranking-list-dialog = "showStudentRankingListDialog"
                                     @close-student-ranking-list-dialog = "args => showStudentRankingListDialog = args"
                                     />

      </el-col>
    </el-row>
  </el-card>

  <!-- 对话框区 -->
  <UpdateLessonDialog :lesson-id="lessonObj['lesson_id']"
                      :show-update-lesson-dialog="showUpdateLessonDialog"
                      @close-update-lesson-dialog="closeUpdateDialog"/>
<!--  <DeleteLessonDialog :lesson-id="lessonObj['lesson_id']"-->
<!--                      :lesson-name="lessonObj['lesson_name']"-->
<!--                      :show-delete-lesson-dialog="showDeleteLessonDialog"-->
<!--                      @close-delete-lesson-dialog="closeDeleteDialog"/>-->
  <AddChapterDialog :lesson-id="lessonObj['lesson_id']"
                    :show-add-chapter-dialog = "showAddChapterDialog"
                    @close-add-chapter-dialog="closeAddChapterDialog"/>




</template>

<style>
/*noinspection CssUnusedSymbol*/
.el-popover.operate-pop {
  background: transparent;
  border: none;
  box-shadow: none
}
</style>