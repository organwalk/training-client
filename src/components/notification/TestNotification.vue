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
      <el-text tag="b">{{  notificationBody['notification_content'] }}：</el-text>
      <el-table :data="Array(notificationBody['notification_quote'])" style="margin-top: 5px;font-size: 12px" border>
        <el-table-column prop="test_title" label="试卷名" min-width="100px" show-overflow-tooltip fixed/>
        <el-table-column prop="start_datetime" label="开始时间" min-width="90px" fixed/>
        <el-table-column prop="end_datetime" label="结束时间" min-width="90px" fixed/>
      </el-table>
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