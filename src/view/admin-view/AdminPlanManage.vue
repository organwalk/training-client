<script setup>

import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {Search} from "@element-plus/icons-vue";
import TcButtonAdd from "@/components/button/tc-button-add.vue";
import {ref} from "vue";
import AdminPlanDialog from "@/view/admin-view/dialog/AdminPlanDialog.vue";

const showPlanDialog = ref(false)
const title = ref()
const keyword = ref()

const closeDialog = (val) => {
  showPlanDialog.value = val
}
const searchByKeyword = (val) => {
  console.log(val)
}
</script>

<template>
  <tc-container-full-row style="height: 5vh">
    <el-menu
        default-active="1"
        mode="horizontal"
        active-text-color="#002fa7"
    >
      <el-menu-item index="1">培训计划列表</el-menu-item>
    </el-menu>
  </tc-container-full-row><br/><br/>
  <!--列表操作栏-->
  <div style="display: flex;flex-direction: column;height: 80vh;">
    <tc-container-full-row>
      <el-row :gutter="15">
        <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
          <tc-button-add @click="() => {showPlanDialog = true; title = '定制培训计划'}">定制培训计划</tc-button-add>
        </el-col>
        <!--      模糊搜索区域-->
        <el-col :xs="10" :sm="10" :md="10" :lg="10" :xl="10">
          <el-input v-model="keyword"
                    @input="searchByKeyword"
                    :prefix-icon="Search"
                    placeholder="请输入培训计划相关信息" />
        </el-col>
      </el-row>
    </tc-container-full-row><br/>
<!--    培训计划列表区域-->

    <AdminPlanDialog :show-plan-dialog="showPlanDialog"
                     :title="title"
                     @close-dialog="closeDialog"/>
  </div>
</template>

<style scoped>

</style>