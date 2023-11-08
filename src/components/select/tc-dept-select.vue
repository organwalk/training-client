<script setup>
import {onBeforeMount, ref, defineEmits, defineProps} from "vue";
import {getDeptList} from "@/api/dept-api";
import {Loading} from "@element-plus/icons-vue";

const props = defineProps({
  defaultValue:Boolean
})
const emit = defineEmits(['getDeptId'])
const deptId = ref()
const deptList = ref()
const disable = ref(false)
const loadingData = async () => {
  disable.value = true
  const res = await getDeptList('999999', 0)
  if (res.code === 2002) {
    deptList.value = res.data.map(({id, deptName}) => ({value: id, label: deptName}))
    if (props.defaultValue){
      deptId.value = deptList.value[0].value
      emit('getDeptId', deptId.value)
    }
  }else {
    emit('getDeptId', null)
  }
  disable.value = false
}
const change = (val) => {
  emit('getDeptId', val)
}
onBeforeMount(async () => {
  await loadingData()
})
</script>

<template>
  <el-row>
    <el-select v-model="deptId"
               placeholder="选择部门"
               @change="change"
               :disabled="disable"
               clearable
               filterable>
      <el-option
          v-for="item in deptList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
  </el-row>
  <el-icon v-if="disable" class="dept-loading"><Loading /></el-icon>
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

.dept-loading {
  animation: spin 1.5s infinite linear;
}
</style>