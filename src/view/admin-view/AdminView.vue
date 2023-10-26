<script setup>
import TcCardCenterContent from "@/components/card/tc-card-center-content.vue";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {User,Suitcase,Files,Bell,Reading} from '@element-plus/icons-vue'
import TcCard from "@/components/card/tc-card.vue";
import {useRoute} from "vue-router";
import {computed} from "vue";

const route = useRoute()
const breadList = [
  {
    path:'/admin/user',
    name:'用户管理'
  },
  {
    path:'/admin/dept',
    name:'部门管理'
  },
  {
    path:'/admin/resource',
    name:'资源管理'
  },
]
const breadName = computed(() => breadList.find(item => item.path === route.path).name)

</script>

<template>
  <!--  左右两段式布局-->
  <el-row>
    <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
      <!--      左侧菜单栏  -->
      <tc-card-center-content class="menu-card">
        <tc-container-full-row >
          <span class="menu-logo">TrainingClient</span>
        </tc-container-full-row><br/>
<!--        tab标签栏-->
        <tc-container-full-row>
          <el-menu
              default-active="user"
              router
          >
            <el-menu-item index="user">
              <el-icon><User/></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>
            <el-menu-item index="dept">
              <el-icon><Suitcase /></el-icon>
              <template #title>部门管理</template>
            </el-menu-item>
            <el-menu-item index="resource">
              <el-icon><Files /></el-icon>
              <template #title>资源管理</template>
            </el-menu-item>
          </el-menu>
        </tc-container-full-row>
      </tc-card-center-content>
    </el-col>
    <el-col :xs="20" :sm="20" :md="20" :lg="20" :xl="20">
      <tc-card class="container-card">
        <el-row>
<!--          顶部面包屑-->
          <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>{{breadName}}</el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
          <el-col :xs="20" :sm="20" :md="20" :lg="20" :xl="20" align="right">
            <el-badge :value="12" class="item">
              <el-button :icon="Bell" circle v-btn/>
            </el-badge>&nbsp;&nbsp;&nbsp;
            <el-button :icon="Reading" circle v-btn />
          </el-col>
        </el-row>
<!--        子路由-->
        <router-view/>
      </tc-card>
    </el-col>
  </el-row>
</template>

<style scoped src="@/css/admin-view.css" />