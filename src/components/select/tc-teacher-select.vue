<script setup>

import {Loading} from "@element-plus/icons-vue";
import {onBeforeMount, ref, defineEmits} from "vue";
import {getTeacherList} from "@/api/user-api";
const teacherId = ref()
const disable = ref(false)
const teacherList = ref()
const emit = defineEmits(['getTeacherIdList'])

const loadingDataList = async () => {
  disable.value = true
  const res = await getTeacherList()
  if (res.code === 2002){
    teacherList.value = res.data.map(({id, realName}) => ({value: id, label: realName}))
  }
  disable.value = false
}

onBeforeMount(async () => {
  await loadingDataList()
})

const change = (teacherIdList) => {
  emit('getTeacherIdList', teacherIdList)
}
</script>

<template>
  <el-row>
    <el-select v-model="teacherId"
               placeholder="选择讲师"
               @change="change"
               :disabled="disable"
               style="width: 100%"
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
  <el-icon v-if="disable" class="dept-loading"><Loading /></el-icon>
</template>

<style scoped>

</style>