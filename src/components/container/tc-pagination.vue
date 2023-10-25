<script setup>
import {defineProps, defineEmits} from "vue"
const props = defineProps({
  total:Number
})
const emit = defineEmits(['pageCurrentChange'])
const whenCurrentChange = (val) => {
  emit('pageCurrentChange', val)
}
</script>

<template>
  <el-pagination background layout="prev, pager, next"
                 @current-change="whenCurrentChange"
                 :total="props.total" />
</template>

<style scoped>

</style>