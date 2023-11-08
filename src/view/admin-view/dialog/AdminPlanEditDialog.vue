<script setup>
import {defineProps, defineEmits, ref, watchEffect, reactive,computed} from "vue";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import TcDateSelect from "@/components/select/tc-date-select.vue";
import {getISO8601} from "@/utils/dateUtil";
import {objectsIsNull} from "@/utils/dataUtil";
import TcButtonConform from "@/components/button/tc-button-conform.vue";
import TcTeacherSelect from "@/components/select/tc-teacher-select.vue";
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
    endSelectDate.value = fatherBasicInfo.value.training_end_time
    startSelectDate.value = fatherBasicInfo.value.training_start_time
  }
})
const teacherIdList = ref()

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
      <el-menu-item index="2" @click="getNowTab">讲师列表</el-menu-item>
      <el-menu-item index="3" @click="getNowTab">学员列表</el-menu-item>
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
        </el-form>
      </div>
      <div v-show="nowTab === '2'">
        <tc-container-full-row>
          <tc-teacher-select @get-teacher-id-list="(list) => {teacherIdList = list;console.log(teacherIdList)}  "/>
        </tc-container-full-row>

      </div>
      <div v-show="nowTab === '3'">学员列表</div>
    </tc-container-full-row>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog('cancel')" :disabled="loading">取消</el-button>
        <tc-button-conform @click="addPlan" :disabled="objectsIsNull(basicInfo)" v-btn>
          确认</tc-button-conform>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>