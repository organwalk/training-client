<script setup>
import {defineProps, defineEmits, ref, watchEffect, reactive, computed} from "vue";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import TcDateSelect from "@/components/select/tc-date-select.vue";
import {getISO8601, validTimeout} from "@/utils/dateUtil";
import TcButtonConform from "@/components/button/tc-button-conform.vue";
import TcTeacherSelect from "@/components/select/tc-teacher-select.vue";
import TcStudentSelect from "@/components/select/tc-student-select.vue";
import {
  addStudentToPlan, addTeacherToPlan,
  deleteStudentById,
  deleteTeacherById,
  updatePlanInfoByPlanId,
  updatePlanStateByPlanId
} from "@/api/plan-api";
import {ElMessage} from "element-plus";
import {arraysEqual, getArrayChanges, objectsIsNull} from "@/utils/dataUtil";
import {usePushNotificationStore} from "@/store/store";

const pushStore = usePushNotificationStore()
const props = defineProps({
  showPlanEditDialog: Boolean,
  basicInfo: Object,
  title: String
})
const emit = defineEmits(['closeEditDialog'])
const showPlanEditDialog = ref()
const loading = ref(false)
const timer = ref()
watchEffect(() => {
  showPlanEditDialog.value = props.showPlanEditDialog
  if (showPlanEditDialog.value){
    timer.value = new Date().getTime();
  }
})


// 清除和重载对话框数据
const clearDialogData = () => {
  nowTab.value = '1'
  teacherTableList.value = []
  studentTableList.value = []
  loadingFatherData()
}
const closeDialog = (des) => {
  showPlanEditDialog.value = false
  emit('closeEditDialog', {
    state: false,
    des: des + '-' + Math.random()
  })
  clearDialogData()
}

// 获取当前所选tab
const nowTab = ref('1')
const getNowTab = (val) => {
  nowTab.value = val.index
}

// 定义数据对象
const basicInfo = reactive({
  training_title: '',
  training_purpose: '',
  training_end_time: ''
})
const fatherBasicInfo = computed(() => props.basicInfo)
const planId = ref()
const checkState = ref([])
const startSelectDate = ref()
const endSelectDate = ref()
const getEndDate = (val) => {
  if (val) {
    basicInfo.training_end_time = getISO8601(new Date(val))
  }
}

const loadingFatherData = () => {
  basicInfo.training_title = fatherBasicInfo.value.training_title
  basicInfo.training_purpose = fatherBasicInfo.value.training_purpose
  basicInfo.training_end_time = fatherBasicInfo.value.training_end_time
  planId.value = fatherBasicInfo.value.training_plan_id
  if (fatherBasicInfo.value.training_state !== '' && checkState.value.length === 0) {
    checkState.value.push(fatherBasicInfo.value.training_state)
  }
  endSelectDate.value = fatherBasicInfo.value.training_end_time
  startSelectDate.value = fatherBasicInfo.value.training_start_time
}
watchEffect(() => {
  if (fatherBasicInfo.value) {
    loadingFatherData()
  }
})
const teacherIdList = ref()
const teacherIdOriginList = ref()
const teacherTableList = ref()
const getTeacherTableList = (list) => {
  teacherTableList.value = list
}
const studentIdList = ref()
const studentIdOriginList = ref()
const studentTableList = ref()
const getStudentTableList = (list) => {
  studentTableList.value = list
}

const statusChange = () => {
  if (checkState.value.length > 1) {
    checkState.value.splice(0, 1)
  }
}

// 校验
const basicInfoNonEqual = (basicObj) => {
  if (objectsIsNull(basicObj)) {
    return false
  }
  return basicInfo.training_title !== fatherBasicInfo.value.training_title
      || basicInfo.training_purpose !== fatherBasicInfo.value.training_purpose
      || basicInfo.training_end_time !== fatherBasicInfo.value.training_end_time;
}
const planStateNonEqual = (checkStateList) => {
  return checkStateList[0] !== fatherBasicInfo.value.training_state
}
const teacherListNonEqual = (teacherList) => {
  return teacherList !== undefined && !arraysEqual(teacherList, teacherIdOriginList.value)
}
const studentListNonEqual = (studentList) => {
  return studentList !== undefined && !arraysEqual(studentList, studentIdOriginList.value)
}

// 编辑
const edit = async () => {
  let successMsgList = []
  let errorMarks = []

  // 编辑基础信息
  if (basicInfoNonEqual(basicInfo)) {
    const basicInfoRes = await updatePlanInfoByPlanId(planId.value, basicInfo)
    if (basicInfoRes.code === 2002) {
      successMsgList.push(basicInfoRes.msg)
    } else {
      errorMarks.push('basicInfo')
    }
  }

  // 修改状态
  if (planStateNonEqual(checkState.value)) {
    const planStateRes = await updatePlanStateByPlanId(planId.value, checkState.value[0])
    if (planStateRes.code === 2002) {
      successMsgList.push(planStateRes.msg)
    } else {
      errorMarks.push('planState')
    }
  }

  // 修改讲师
  if (teacherListNonEqual(teacherIdList.value)){
    const teaChanges = getArrayChanges(teacherIdOriginList.value, teacherIdList.value)
    if (teaChanges.decreased.length !== 0){
      for (const item of teaChanges.decreased){
        const teaReduceRes = await deleteTeacherById(planId.value, item)
        if (teaReduceRes.code === 2002){
          successMsgList.push(teaReduceRes.msg)
        }else {
          errorMarks.push('teaReduceMark')
        }
      }
    }
    if (teaChanges.increased.length !== 0) {
      const teaAddRes = await addTeacherToPlan(planId.value, teaChanges.increased)
      if (teaAddRes.code === 2002){
        successMsgList.push(teaAddRes.msg)
      }else {
        errorMarks.push('teaAddMark')
      }
    }
  }

  // 修改学员
  if (studentListNonEqual(studentIdList.value)) {
    const changes = getArrayChanges(studentIdOriginList.value, studentIdList.value)
    if (changes.decreased.length !== 0) {
      for (const item of changes.decreased) {
        const reduceRes = await deleteStudentById(planId.value, item)
        if (reduceRes.code === 2002){
          successMsgList.push(reduceRes.msg)
        }else {
          errorMarks.push('stuReduceMark')
        }
      }
      noticePlan(changes.decreased, "decreased")
    }
    if (changes.increased.length !== 0) {
      const addRes = await addStudentToPlan(planId.value, changes.increased)
      if (addRes.code === 2002){
        if (addRes.msg.includes("添加成功，但部分员工未被分配部门，无法被纳入培训计划")){
          let integerArray = addRes.msg.split(":")[1].replace('[','').replace(']','').split(',').map(Number)
          successMsgList.push(addRes.msg.split(":")[0])
          noticePlan(integerArray, "add")
        }else {
          successMsgList.push(addRes.msg)
          noticePlan(changes.increased, "add")
        }

      }else {
        errorMarks.push('addMark')
      }
    }
  }

  // 根据处理结果返回信息提示
  if (successMsgList.length > 0) {
    successMsgList.forEach(item => ElMessage({
      type: 'success',
      grouping: true,
      message: item
    }))
    if (errorMarks.length === 0) {
      closeDialog("edit")
    }
  }
}

const noticePlan = (userList, type) => {
  let content = type === 'add' ? "您被纳入了一个培训计划" : "您被移出培训计划"
  let obj = {
    'sourceType': 'plan',
    'content': content,
    'quoteId': planId.value,
    'receiverIdList': userList
  }
  pushStore.setPushBody(obj)
}

const validEdit = (basic, stateList, teacherList, studentList) => {
  return !(basic || stateList || teacherList || studentList);
}

const getTeacherProgress = (val) => {
  console.log(val)
  return typeof val === "undefined" ? 0 : parseInt(String(val * 100))
}
</script>

<template>
  <el-dialog v-model="showPlanEditDialog"
             v-if="showPlanEditDialog"
             :title="props.title"
             top="5vh"
             fullscreen
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :before-close="closeDialog"
             :show-close="!loading"
  >
    <el-card shadow="never" :key="timer">
      <!--    tab栏-->
      <el-menu
          default-active="1"
          mode="horizontal"
          active-text-color="#002fa7"
      >
        <el-menu-item index="1" @click="getNowTab">基本信息</el-menu-item>
        <el-menu-item index="2" @click="getNowTab">讲师列表</el-menu-item>
        <el-menu-item index="3" @click="getNowTab">学员列表</el-menu-item>
      </el-menu>
      <br/>
      <tc-container-full-row>
        <div v-show="nowTab === '1'">
          <el-form :model="basicInfo" label-width="100px" v-loading="loading">
            <el-form-item label="培训计划标题">
              <el-input v-model="basicInfo.training_title"
                        placeholder="请输入培训计划标题" maxlength="15" show-word-limit/>
            </el-form-item>
            <el-form-item label="培训计划目的">
              <el-input v-model="basicInfo.training_purpose"
                        :rows="4"
                        type="textarea"
                        placeholder="请输入培训计划目的" maxlength="100" show-word-limit/>
            </el-form-item>
            <el-form-item label="选择开始时间">
              <tc-date-select :valid-type="'start'"
                              :select-date="startSelectDate"
                              :disable="true"/>
            </el-form-item>
            <el-form-item label="选择结束时间">
              <tc-date-select :valid-type="'end'"
                              :select-date="endSelectDate"
                              :rule-date="new Date(startSelectDate)"
                              @get-select-date="getEndDate"/>
            </el-form-item>
            <el-form-item label="培训计划状态">
              <el-checkbox-group v-model="checkState" @change="statusChange">
                <el-checkbox-button :label="'ongoing'">正在进行</el-checkbox-button>
                <el-checkbox-button :label="'over'">已经完成</el-checkbox-button>
                <el-checkbox-button :label="'timeout'"
                                    :disabled="validTimeout(fatherBasicInfo.training_end_time)">
                  逾期超时
                </el-checkbox-button>
                <el-checkbox-button :label="'end'">已经结束</el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </div>
        <div v-show="nowTab === '2'">
          <tc-container-full-row>
            <tc-teacher-select :plan-id="planId"
                               @get-teacher-id-origin-list="(origin) => teacherIdOriginList = origin"
                               @get-teacher-id-list="(list) => teacherIdList = list"
                               @get-teacher-table-list="getTeacherTableList"/>
            <br/>
            <el-table :data="teacherTableList" :default-sort="{ prop: 'id', order: 'descending' }"
                      style="width: 100%"
                      height="350"
                      border empty-text="暂未添加教师"
                      highlight-current-row stripe v-loading="loading">
              <el-table-column type="expand">
                <template #default="props">
                  <el-card shadow="never">
                    <h3>{{ props.row.label }}老师所授课程情况如下：</h3>
                    <!--suppress JSValidateTypes -->
                    <el-table :data="props.row['progress']['lesson_progress']"
                              height="350" empty-text="暂未授课"
                              border highlight-current-row>
                      <el-table-column label="课程ID" prop="id" />
                      <el-table-column label="课程名称" prop="lesson_name" />
                      <el-table-column label="课程进度">
                        <template #default="scope">
                          <el-progress :percentage="getTeacherProgress(scope.row['total_progress'])"/>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-card>
                </template>
              </el-table-column>
              <el-table-column type="index" fixed/>
              <el-table-column prop="value" label="讲师ID" sortable/>
              <el-table-column prop="label" label="讲师姓名"/>
              <el-table-column label="讲师总体授课进度">
                <template #default="scope">
                  <el-progress :percentage="getTeacherProgress(scope.row.progress['all_total_progress'])"/>
                </template>
              </el-table-column>
            </el-table>
          </tc-container-full-row>
        </div>
        <div v-show="nowTab === '3'">
          <tc-container-full-row>
            <tc-student-select :plan-id="planId"
                               @get-student-id-origin-list="list => studentIdOriginList = list"
                               @get-student-id-list="list => studentIdList = list"
                               @get-student-table-list="getStudentTableList"/>
          </tc-container-full-row>
          <br/>
          <el-table :data="studentTableList" :default-sort="{ prop: 'id', order: 'descending' }"
                    style="width: 100%"
                    height="350"
                    border
                    highlight-current-row stripe v-loading="loading">
            <el-table-column type="index" fixed/>
            <el-table-column prop="value" label="学员ID" sortable/>
            <el-table-column prop="label" label="学员姓名"/>
          </el-table>
        </div>
      </tc-container-full-row>
    </el-card>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog('cancel')" :disabled="loading">取消</el-button>
        <tc-button-conform @click="edit"
                           :disabled="validEdit(
                               basicInfoNonEqual(basicInfo),
                               planStateNonEqual(checkState),
                               teacherListNonEqual(teacherIdList),
                               studentListNonEqual(studentIdList)
                               )" v-btn>
          确认</tc-button-conform>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>