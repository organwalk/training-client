<script setup>
import UserCloudAllFile from "@/view/user-view/cloud/all-file/UserCloudAllFile.vue";
import UserCloudMyFile from "@/view/user-view/cloud/my-file/UserCloudMyFile.vue";

</script>

<template>
  <el-row style="height: 90vh">
    <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18">
      <UserCloudAllFile/>
    </el-col>
    <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
      <UserCloudMyFile/>
    </el-col>
  </el-row>
</template>

<style scoped>

</style>