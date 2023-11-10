<script setup>

import {Loading} from "@element-plus/icons-vue";
import {onBeforeMount, ref, defineEmits, defineProps} from "vue";
import {getStudentList} from "@/api/user-api";
import {getStudentListByPlanId} from "@/api/plan-api";

const studentId = ref()
const disable = ref(false)
const studentList = ref()
const props = defineProps({
  planId: Number,
})
const emit = defineEmits([
  'getStudentIdList',
  'getStudentIdOriginList',
  'getStudentTableList'
])


const loadingDataList = async () => {
  disable.value = true
  const res = await getStudentList()
  if (res.code === 2002) {
    studentList.value = res.data.map(({id, realName}) => ({value: id, label: realName}))
    const studentIdListRes = await getStudentListByPlanId(props.planId)
    if (studentIdListRes.code === 2002){
      studentId.value = studentIdListRes.data.map(item => item.training_student_id)
    }
    emit('getStudentIdOriginList', studentId.value)
    emit('getStudentTableList', studentList.value.filter(item => studentId.value.includes(item.value)))
  }
  disable.value = false
}

onBeforeMount(async () => {
  await loadingDataList()
})

const change = (studentIdList) => {
  emit('getStudentIdList', studentIdList)
  emit('getStudentTableList', studentList.value.filter(item => studentIdList.includes(item.value)))
}
</script>

<template>
  <el-row>
    <el-select v-model="studentId"
               placeholder="在此处检索及选择学员"
               @change="change"
               :disabled="disable"
               style="width: 100%"
               clearable
               multiple
               filterable>
      <el-option
          v-for="item in studentList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
  </el-row>
  <el-icon v-if="disable" class="student-loading">
    <Loading/>
  </el-icon>
</template>

<style scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.student-loading {
  animation: spin 1.5s infinite linear;
}
</style>