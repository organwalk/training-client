<script setup>
import {defineProps, ref} from "vue"
import {isValidJSON} from "@/utils/dataUtil";

defineProps({
  notificationBody: Object
})
const userName = ref(sessionStorage.getItem("username"))

</script>

<template>
  <el-row>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <el-text size="small">来自：{{ notificationBody['notification_sender'] }}
        <template v-if="isValidJSON(notificationBody['notification_content'])">
          -> {{ JSON.parse(notificationBody["notification_content"]).lessonName }}
          | {{ JSON.parse(notificationBody["notification_content"])['chapterName'] }}
        </template>
      </el-text>
    </el-col>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <el-text tag="b">回复<el-text type="primary">@{{ userName }}</el-text>：
        {{ notificationBody['notification_quote']['content'] }}
      </el-text>
    </el-col>
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" v-if="isValidJSON(notificationBody['notification_content'])">
      <el-tooltip content="仅展示主楼评论">
        <div style="border-radius: 5px; padding: 10px; margin-top:5px;background-color: #f1f2f3">
          <el-text size="small">{{ JSON.parse(notificationBody["notification_content"]).comment }}</el-text>
        </div>
      </el-tooltip>
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