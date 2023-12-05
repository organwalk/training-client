<script setup>
import UserCloudAllFile from "@/view/user-view/cloud/all-file/UserCloudAllFile.vue";
import UserCloudMyFile from "@/view/user-view/cloud/my-file/UserCloudMyFile.vue";
import {ref} from "vue";

const loading = ref(false)
</script>

<template>
  <el-progress :percentage="50" color="#333" :duration="4" :indeterminate="true" :show-text="false" v-if="loading"/>
  <el-row style="height: 90vh">
    <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18">
      <UserCloudAllFile @loading="args => loading = args" v-show="!loading"/>
    </el-col>
    <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
      <UserCloudMyFile v-show="!loading"/>
    </el-col>
  </el-row>
</template>

<style scoped>

</style>