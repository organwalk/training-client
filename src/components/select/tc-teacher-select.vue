<script setup>

import {Loading} from "@element-plus/icons-vue";
import {onBeforeMount, ref, defineEmits, defineProps} from "vue";
import {getTeacherList} from "@/api/user-api";
import {getTeacherListByPlanId} from "@/api/plan-api";
const teacherId = ref()
const disable = ref(false)
const teacherList = ref()
const props = defineProps({
  planId:Number
})
const emit = defineEmits(['getTeacherIdList', 'getTeacherIdOriginList', 'getTeacherTableList'])

const loadingDataList = async () => {
  disable.value = true
  const res = await getTeacherList()
  if (res.code === 2002){
    teacherList.value = res.data.map(({id, realName}) => ({value: id, label: realName}))
    const teacherIdListRes = await getTeacherListByPlanId(props.planId)
    if (teacherIdListRes.code === 2002){
      teacherId.value = teacherIdListRes.data.map(item => item.training_teacher_id)
    }
    emit('getTeacherIdOriginList', teacherId.value)
    emit('getTeacherTableList', teacherList.value.filter(item => teacherId.value.includes(item.value)))
  }
  disable.value = false
}

onBeforeMount(async () => {
  await loadingDataList()
})

const change = (teacherIdList) => {
  emit('getTeacherIdList', teacherIdList)
  emit('getTeacherTableList', teacherList.value.filter(item => teacherIdList.includes(item.value)))
}
</script>

<template>
  <el-row>
    <el-select v-model="teacherId"
               placeholder="在此处检索及选择讲师"
               @change="change"
               :disabled="disable"
               style="width: 100%;"
               clearable
               multiple
               filterable>
      <el-option
          v-for="item in teacherList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
  </el-row>
  <el-icon v-if="disable" class="teacher-loading"><Loading /></el-icon>
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

.teacher-loading {
  animation: spin 1.5s infinite linear;
}
</style>