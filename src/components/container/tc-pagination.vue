<script setup>
import {defineProps, defineEmits, ref, watchEffect} from "vue"
const props = defineProps({
  total:Number,
  small:Boolean
})

const isSmall = ref(false)
const emit = defineEmits(['pageCurrentChange'])
const whenCurrentChange = (val) => {
  emit('pageCurrentChange', val)
}

watchEffect(() => {
  if (props.small){
    isSmall.value = props.small
  }else {
    isSmall.value = false
  }
})




</script>

<template>
  <el-pagination background layout="prev, pager, next"
                 @current-change="whenCurrentChange"
                 :small="isSmall"
                 :total="total" />
</template>

<style scoped>

</style>