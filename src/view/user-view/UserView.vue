<script setup>
import websiteIcon from "@/assets/website_icon.png";
import {Bell, Reading} from "@element-plus/icons-vue";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {useRouter} from "vue-router";

const router = useRouter()

</script>

<template>
  <!--顶部tag栏-->
  <tc-container-full-row>
    <el-card shadow="never" :body-style="{paddingBottom:'15px',paddingTop:'15px'}" style="border-radius: 0;height: 10vh">
      <el-row style="height: 5vh">
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <div style="display: flex;align-items: center;" @click="router.push('/user')">
            <img :src="websiteIcon" alt="404" style="width: 40px;height: 40px">
            <span class="menu-logo" style="margin-left: 5px">TrainingClient</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" align="right">
          <el-badge :value="12">
            <el-button :icon="Bell" circle v-btn/>
          </el-badge>&nbsp;&nbsp;&nbsp;
          <el-button :icon="Reading" circle v-btn/>
        </el-col>
      </el-row>
    </el-card>
  </tc-container-full-row>
  <router-view/>
</template>

<style scoped>
.menu-logo {
  user-select: none;
  font-family: 微软雅黑, system-ui;
  font-weight: bolder;
  font-size: 1rem;
}
</style>