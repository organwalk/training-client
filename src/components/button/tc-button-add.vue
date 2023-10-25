<script setup>
import {Plus} from '@element-plus/icons-vue'
</script>

<template>
  <el-button :icon="Plus" type="primary" color="#002fa7" v-btn style="width: 100%">
    <slot/>
  </el-button>
</template>

<style scoped>

</style>