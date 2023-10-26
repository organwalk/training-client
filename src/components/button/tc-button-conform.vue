<template>
  <el-button type="primary" color="#002fa7" :loading="props.loading">
    <slot/>
  </el-button>
</template>

<script setup>
import {defineProps} from 'vue'
const props = defineProps({
  loading:Boolean
})
</script>