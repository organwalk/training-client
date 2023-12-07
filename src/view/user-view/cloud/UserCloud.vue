<script setup>
import UserCloudAllFile from "@/view/user-view/cloud/all-file/UserCloudAllFile.vue";
import UserCloudMyFile from "@/view/user-view/cloud/my-file/UserCloudMyFile.vue";
import {ref} from "vue";

const loading = ref(false)
</script>

<template>
  <el-progress :percentage="50" color="#333" :duration="4" :indeterminate="true" :show-text="false" v-if="loading"/>
  <div>
    <el-row style="height: 90vh" v-show="!loading">
      <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18">
        <UserCloudAllFile @loading="args => loading = args" />
      </el-col>
      <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
        <UserCloudMyFile/>
      </el-col>
    </el-row>
  </div>

</template>

<style scoped>

</style>