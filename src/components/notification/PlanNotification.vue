<script setup>
import {defineProps} from "vue"

defineProps({
  notificationBody: Object
})
</script>

<template>
  <el-row>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <el-text size="small">来自：{{ notificationBody['notification_sender'] }}</el-text>
    </el-col>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <el-text tag="b">{{ notificationBody['notification_content'] }}：</el-text>
    </el-col>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <el-tag style="margin-top: 5px">{{ notificationBody['notification_quote']['training_title'] }}</el-tag>
    </el-col>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <el-text style="font-size: 0.7rem;margin-top: 5px" size="small">{{
          notificationBody['create_datetime']
        }}
      </el-text>
    </el-col>
  </el-row>
</template>

<style scoped>

</style>