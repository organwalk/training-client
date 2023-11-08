<script setup>
import {defineProps, ref, defineEmits, watchEffect, reactive} from "vue";
import TcDateSelect from "@/components/select/tc-date-select.vue";
import * as dateUtil from "@/utils/dateUtil"
import {clearObjectValues, objectsIsNull} from "@/utils/dataUtil";
import TcDeptSelect from "@/components/select/tc-dept-select.vue";
import TcButtonConform from "@/components/button/tc-button-conform.vue";
import {createTrainingPlan} from "@/api/plan-api";
import {ElMessage} from "element-plus";
import {getISO8601} from "@/utils/dateUtil";
import {withLoading} from "@/utils/functionUtil";

// 定义全局变量
const props = defineProps({
  showPlanDialog: Boolean,
  title:String,
})
const emit = defineEmits(['closeDialog'])
const showPlanDialog = ref()
watchEffect(() => {
  showPlanDialog.value = props.showPlanDialog
})
const closeDialog = (des) => {
  showPlanDialog.value = false
  emit('closeDialog', {
    state:false,
    des:des + '-' + Math.random()
  })
  // 初始化数据
  clearObjectValues(planObj)
  startSelectDate.value = dateUtil.getNowDate()
  endSelectDate.value = new Date(dateUtil.getNowDate().setDate(dateUtil.getNowDate().getDate() + 1))
}
const loading = ref(false)

// 定义创建培训计划所需对象
const planObj = reactive({
  training_title:"",
  training_purpose:"",
  training_start_time:"",
  training_end_time:"",
  dept_id:""
})

// 定义时间选择器相关变量
const startSelectDate = ref(dateUtil.getNowDate())
const endSelectDate = ref(new Date(dateUtil.getNowDate().setDate(dateUtil.getNowDate().getDate() + 7)))
const startDate = ref()
const getStartDate = (val) => {
  if (val){
    startDate.value = val
    planObj.training_start_time = getISO8601(new Date(val))
  }
}
const getEndDate = (val) => {
  if (val){
    planObj.training_end_time = getISO8601(new Date(val))
  }
}
watchEffect(() => {
  if (startDate.value){
    const newStartDate = startDate.value
    endSelectDate.value = new Date(new Date(newStartDate).setDate(newStartDate.getDate() + 7));
  }
})

// 创建培训计划
const addPlan = withLoading(async () => {
  const res = await createTrainingPlan(planObj)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    closeDialog('add')
  }
}, loading)

</script>

<template>
  <el-dialog v-model="showPlanDialog"
             :title="props.title"
             v-if="showPlanDialog"
             width="50%"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :before-close="closeDialog"
             :show-close="!loading"
  >
    <el-form :model="planObj" label-width="100px" v-loading="loading">
      <el-form-item label="培训计划标题">
        <el-input v-model="planObj.training_title"
                  placeholder="请输入培训计划标题" maxlength="15" show-word-limit/>
      </el-form-item>
      <el-form-item label="培训计划目的">
        <el-input v-model="planObj.training_purpose"
                  :rows="4"
                  type="textarea"
                  placeholder="请输入培训计划目的" maxlength="100" show-word-limit/>
      </el-form-item>
      <el-form-item label="选择开始时间">
        <tc-date-select :valid-type="'start'"
                        :select-date="startSelectDate"
                        @get-select-date="getStartDate"/>
      </el-form-item>
      <el-form-item label="选择结束时间">
        <tc-date-select :valid-type="'end'"
                        :select-date="endSelectDate"
                        :rule-date="new Date(startDate)"
                        @get-select-date="getEndDate"/>
      </el-form-item>
      <el-form-item label="选择培训部门">
        <tc-dept-select :default-value="true"
                        @get-dept-id="(deptId) => planObj.dept_id = deptId"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog('cancel')" :disabled="loading">取消</el-button>
        <tc-button-conform @click="addPlan" :disabled="objectsIsNull(planObj)" v-btn>
          确认</tc-button-conform>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>