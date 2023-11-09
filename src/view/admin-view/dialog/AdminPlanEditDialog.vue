<script setup>
import {defineProps, defineEmits, ref, watchEffect, reactive, computed} from "vue";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import TcDateSelect from "@/components/select/tc-date-select.vue";
import {getISO8601, validTimeout} from "@/utils/dateUtil";
import TcButtonConform from "@/components/button/tc-button-conform.vue";
import TcTeacherSelect from "@/components/select/tc-teacher-select.vue";
import TcStudentSelect from "@/components/select/tc-student-select.vue";
import {updatePlanInfoByPlanId, updatePlanStateByPlanId} from "@/api/plan-api";
import {ElMessage} from "element-plus";
import {objectsIsNull} from "@/utils/dataUtil";
const props = defineProps({
  showPlanEditDialog:Boolean,
  basicInfo:Object,
  title:String
})
const emit = defineEmits(['closeEditDialog'])
const showPlanEditDialog = ref()
const loading = ref(false)
watchEffect(() => {
  showPlanEditDialog.value = props.showPlanEditDialog
})
const closeDialog = (des) => {
  showPlanEditDialog.value = false
  emit('closeEditDialog', {
    state:false,
    des:des + '-' + Math.random()
  })
}

// 获取当前所选tab
const nowTab = ref('1')
const getNowTab = (val) => {
  nowTab.value = val.index
}

// 定义数据对象
const basicInfo = reactive({
  training_title:'',
  training_purpose:'',
  training_end_time:''
})
const fatherBasicInfo = computed(() => props.basicInfo)
const planId = ref()
const checkState = ref([])
const startSelectDate = ref()
const endSelectDate = ref()
const getEndDate = (val) => {
  if (val){
    basicInfo.training_end_time = getISO8601(new Date(val))
  }
}
watchEffect(() => {
  if (fatherBasicInfo.value){
    basicInfo.training_title = fatherBasicInfo.value.training_title
    basicInfo.training_purpose = fatherBasicInfo.value.training_purpose
    basicInfo.training_end_time = fatherBasicInfo.value.training_end_time
    planId.value = fatherBasicInfo.value.training_plan_id
    if (fatherBasicInfo.value.training_state !== '' && checkState.value.length === 0){
      checkState.value.push(fatherBasicInfo.value.training_state)
    }
    endSelectDate.value = fatherBasicInfo.value.training_end_time
    startSelectDate.value = fatherBasicInfo.value.training_start_time
  }
})
const teacherIdList = ref()
const studentIdList = ref()

const statusChange = () => {
  if(checkState.value.length > 1){
    checkState.value.splice(0,1)
    console.log(checkState.value)
  }
}

// 校验
const basicInfoNonEqual = (basicObj) => {
  if (objectsIsNull(basicObj)){
    return false
  }
  return basicInfo.training_title !== fatherBasicInfo.value.training_title
      || basicInfo.training_purpose !== fatherBasicInfo.value.training_purpose
      || basicInfo.training_end_time !== fatherBasicInfo.value.training_end_time;
}
const planStateNonEqual = (checkStateList) => {
  return checkStateList[0] !== fatherBasicInfo.value.training_state
}

// 编辑
const edit = async () => {
  let successMsgList = []
  let errorMarks = []

  // 编辑基础信息
  if (basicInfoNonEqual(basicInfo)){
    const basicInfoRes = await updatePlanInfoByPlanId(planId.value, basicInfo)
    if (basicInfoRes.code === 2002){
      successMsgList.push(basicInfoRes.msg)
    }else {
      errorMarks.push('basicInfo')
    }
  }

  // 修改状态
  if (planStateNonEqual(checkState.value)){
    const planStateRes = await updatePlanStateByPlanId(planId.value, checkState.value[0])
    if (planStateRes.code === 2002){
      successMsgList.push(planStateRes.msg)
    }else {
      errorMarks.push('planState')
    }
  }

  // 根据处理结果返回信息提示
  if (successMsgList.length > 0){
    successMsgList.forEach(item => ElMessage({
      type:'success',
      grouping:true,
      message:item
    }))
    if (errorMarks.length === 0){
      closeDialog("edit")
    }
  }

}

const validEdit = (basic, stateList) => {
  if (basic || stateList){
    return false
  } else {
    return true
  }
}
</script>

<template>
  <el-dialog v-model="showPlanEditDialog"
             :title="props.title"
             v-if="showPlanEditDialog"
             width="50%"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :before-close="closeDialog"
             :show-close="!loading"
  >
<!--    tab栏-->
    <el-menu
        default-active="1"
        mode="horizontal"
        active-text-color="#002fa7"
    >
      <el-menu-item index="1" @click="getNowTab">基本信息</el-menu-item>
      <el-menu-item index="2" @click="getNowTab">成员列表</el-menu-item>
    </el-menu><br/>
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
          <el-form-item label="培训计划状态" >
            <el-checkbox-group v-model="checkState" @change="statusChange">
              <el-checkbox-button :label="'ongoing'">正在进行</el-checkbox-button>
              <el-checkbox-button :label="'over'">已经完成</el-checkbox-button>
              <el-checkbox-button :label="'timeout'" :disabled="validTimeout(fatherBasicInfo.training_end_time)">逾期超时</el-checkbox-button>
              <el-checkbox-button :label="'end'">已经结束</el-checkbox-button>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
      <div v-show="nowTab === '2'">
        <p>讲师列表</p>
        <tc-container-full-row>
          <tc-teacher-select :plan-id="planId" @get-teacher-id-list="(list) => teacherIdList = list"/>
        </tc-container-full-row>

        <p>学员列表</p>
        <tc-container-full-row>
          <tc-student-select :plan-id="planId" @get-student-id-list="(list) => studentIdList = list" />
        </tc-container-full-row>

      </div>
    </tc-container-full-row>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog('cancel')" :disabled="loading">取消</el-button>
        <tc-button-conform @click="edit" :disabled="validEdit(basicInfoNonEqual(basicInfo), planStateNonEqual(checkState))" v-btn>
          确认</tc-button-conform>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>