<script setup>
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import TcButtonAdd from "@/components/button/tc-button-add.vue";
import {onBeforeMount, ref} from "vue";
import {getUserAccountByKeyword, getUserAccountList} from "@/api/user-api";
import TcPagination from "@/components/container/tc-pagination.vue";
import AdminUserDialog from "@/view/admin-view/dialog/AdminUserDialog.vue";
import {Search} from "@element-plus/icons-vue";

// 定义当前页面全局变量
const activeTab = ref('1')  // 默认tab
const nowTab = ref('1')  // 所处tab
const placeholder = ref('请输入员工信息关键词') // 默认搜索提示词
const placeList = ['请输入员工信息关键词', '请输入教师信息关键词', '请输入管理员信息关键词'] // 提示词列表

// 获取当前所处tab，并更新状态
const getNowTab = (val) => {
  nowTab.value = val.index
  placeholder.value = placeList[nowTab.value - 1]
  keyword.value = ''
  loading.value = true
  getUserAccountListFromApi(0)
}

// 获取对话框子组件的活跃状态
const title = ref()
const showUserDialog = ref(false)
const closeDialog = (val) => {
  showUserDialog.value = val
}
const newUser = (val) => {
  if (val){
    loading.value = true
    getUserAccountListFromApi(0)
  }
}

// 获取用户列表
const loading = ref(true)
const accountInfoList = ref()
const total = ref()
const uid = ref()

// 直接获取用户账号信息列表
const getUserAccountListFromApi = async (offset) => {
  const res = await getUserAccountList(nowTab.value, offset)
  if (res.code === 5005){
    accountInfoList.value = []
  }{
    total.value = res.total
    accountInfoList.value = res.data
  }
  loading.value = false
}

// 获取新的页数
const getNewPageNumber = (val) => {
  loading.value = true
  const offset = (val-1) * 10
  getUserAccountListFromApi(offset)
}

// 定义模糊搜索功能
const keyword = ref('')
const searchByKeyword = (keyword) => {
  if (keyword.length !== 0 && keyword.replace(/\s/g, '') !== ''){
    loading.value = true
    setTimeout(async () => {
      const res = await getUserAccountByKeyword(keyword, nowTab.value, 0)
      if (res.code === 5005){
        accountInfoList.value = []
      }else {
        total.value = res.total
        accountInfoList.value = res.data
      }
      loading.value = false
    }, 500)
  }else {
    loading.value = true
    getUserAccountListFromApi(0)
  }
}

// 组件挂载前的动作
onBeforeMount(() => {
  getUserAccountListFromApi(0)
})
</script>

<template>
<!--  tab标签栏-->
  <tc-container-full-row>
    <el-menu
        :default-active="activeTab"
        mode="horizontal"
        active-text-color="#002fa7"
    >
      <el-menu-item index="1" @click="getNowTab">员工列表</el-menu-item>
      <el-menu-item index="2" @click="getNowTab">讲师列表</el-menu-item>
      <el-menu-item index="3" @click="getNowTab">管理员列表</el-menu-item>
    </el-menu>
  </tc-container-full-row><br/>
  <!--列表操作栏-->
  <div style="height: 80vh;overflow-y: auto">
  <tc-container-full-row>
    <el-row :gutter="15">
      <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
        <tc-button-add @click="() => {showUserDialog = true; title = '新增用户'}">新增用户</tc-button-add>
      </el-col>
<!--      模糊搜索区域-->
      <el-col :xs="10" :sm="10" :md="10" :lg="10" :xl="10">
        <el-input v-model="keyword"
                  @input="searchByKeyword"
                  :prefix-icon="Search"
                  :placeholder="placeholder" />
      </el-col>
    </el-row>
  </tc-container-full-row><br/>
  <!--    表格区域-->
  <tc-container-full-row>
    <el-table :data="accountInfoList" :default-sort="{ prop: 'id', order: 'descending' }"
              style="width: 100%"
              highlight-current-row stripe v-loading="loading">
      <el-table-column type="index" fixed/>
      <el-table-column prop="id" label="用户UID" sortable/>
      <el-table-column prop="username" label="用户名"/>
      <el-table-column prop="realName" label="真实姓名"/>
      <el-table-column prop="mobile" label="手机号码"/>
      <el-table-column prop="auth.authName" label="身份">
        <template #default="scope">
          <span v-if="scope.row.auth.authName === 'none'">员工</span>
          <span v-else>{{ scope.row.auth.authName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="() => {showUserDialog = true; title = '编辑用户'; uid = scope.row.id}">
            编辑</el-button>
          <el-button size="small" type="danger" @click="() => {showUserDialog = true; title = '删除用户'; uid = scope.row.id}">删除</el-button>
        </template>
      </el-table-column>
    </el-table><br/>
    <!--  分页器区域-->
    <tc-container-full-row>
      <tc-pagination :total="total" @page-current-change="getNewPageNumber"/>
    </tc-container-full-row>
  </tc-container-full-row>
  </div>
<!--  添加用户弹窗-->
  <admin-user-dialog :show-user-dialog="showUserDialog"
                         v-if="showUserDialog"
                         @close-dialog="closeDialog"
                         @new-user="newUser"
                         :title="title" :uid="uid" :menu-index="nowTab"/>

</template>

<style scoped src="@/css/admin-user-manage.css"/>