<script setup>
import {onBeforeMount, ref, defineEmits} from "vue";
import {getDeptList} from "@/api/dept-api";

const emit = defineEmits(['getDeptId','getDeptIdState'])
const deptId = ref()
const deptList = ref()
const disable = ref(false)
const loadingData = async () => {
  disable.value = true
  emit('getDeptIdState', true)
  const res = await getDeptList('1000', 0)
  if (res.code === 2002) {
    deptList.value = res.data.map(({id, deptName}) => ({value: id, label: deptName}))
    deptId.value = deptList.value[0].value
    emit('getDeptId', deptId.value)
  }else {
    emit('getDeptId', null)
  }
  disable.value = false
  emit('getDeptIdState', false)
}
const change = (val) => {
  emit('getDeptId', val)
}
onBeforeMount(async () => {
  await loadingData()
})
</script>

<template>
  <el-select v-model="deptId"
             placeholder="需要选择一个有效部门"
             @change="change"
             :disabled="disable"
             filterable>
    <el-option
        v-for="item in deptList"
        :key="item.value"
        :label="item.label"
        :value="item.value"
    />
  </el-select>
</template>

<style scoped>

</style>