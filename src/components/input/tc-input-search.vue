<script setup>
import {Search} from '@element-plus/icons-vue'
import {defineProps} from 'vue'
const props = defineProps({
  placeholder:String
})

</script>

<template>
  <el-input :prefix-icon="Search"
            :placeholder="props.placeholder" />
</template>

<style scoped>

</style>