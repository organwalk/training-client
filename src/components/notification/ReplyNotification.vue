<script setup>
import {defineProps, ref} from "vue"

defineProps({
  notificationBody: Object
})
const userName = ref(sessionStorage.getItem("username"))
</script>

<template>
  <el-row>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <el-text size="small">来自：{{ notificationBody['notification_sender'] }}</el-text>
    </el-col>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <el-text tag="b">回复<el-text type="primary">@{{ userName }}</el-text>：
        {{ notificationBody['notification_quote']['content'] }}
      </el-text>
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