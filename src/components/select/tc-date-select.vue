<script setup>
import {ref, watchEffect, defineProps, defineEmits, onBeforeMount, watch, computed} from "vue";
import * as dateUtil from "@/utils/dateUtil"

const props = defineProps({
  validType:String,
  selectDate:Date,
  ruleDate:Date,
  disable:Boolean
})
const emit = defineEmits(["getSelectDate"])
const selectDate = ref()
const validType = ref()
const ruleDate = computed(()=> props.ruleDate)
const disable = ref()

watchEffect(() => {
  validType.value = props.validType
  disable.value = props.disable
})
watchEffect(() => {
  emit('getSelectDate', selectDate.value)
})
watch(ruleDate, (newVal, oldVal) => {
  if (newVal !== oldVal){
    selectDate.value = props.selectDate
  }
})

onBeforeMount(() => {
  selectDate.value = props.selectDate
  emit('getSelectDate', selectDate.value)
})

const disabledDate = (checkDate) => {
  return dateUtil.validDateDisabled(validType.value, ruleDate.value, checkDate)
}


</script>

<template>
  <el-date-picker
      v-model="selectDate"
      type="date"
      placeholder="选择日期"
      :clearable="false"
      :disabled-date="disabledDate"
      :disabled="disable"
  />
</template>

<style scoped>

</style>