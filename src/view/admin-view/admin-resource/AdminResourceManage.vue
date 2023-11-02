<script setup>

import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {onBeforeMount, ref} from "vue";
import {Search} from "@element-plus/icons-vue";
import TcButtonAdd from "@/components/button/tc-button-add.vue";
import {getDeptList} from "@/api/dept-api";
import {getResourceTagByDeptId} from "@/api/resource-api";
import AdminNormalResourceDialog from "@/view/admin-view/dialog/AdminNormalResourceDialog.vue";
import AdminNormalResource from "@/view/admin-view/admin-resource/AdminNormalResource.vue";
import AdminTagResource from "@/view/admin-view/admin-resource/AdminTagResource.vue";
import AdminTagResourceDialog from "@/view/admin-view/dialog/AdminTagResourceDialog.vue";
import TcDeptSelect from "@/components/select/tc-dept-select.vue";

// 定义当前页面全局变量
const activeTab = ref('2')  // 默认tab
const nowTab = ref('2')  // 所处tab
const placeholder = ref('请输入普通资源信息关键词') // 默认搜索提示词
const placeList = ['请输入资源标签信息关键词', '请输入普通资源信息关键词', '请输入课程教材信息关键词'] // 提示词列表
const dialogList = [{tab: '1', title: '创建资源标签'}, {tab: '2', title: '上传普通资源'}, {tab: '3', title: ''}]
const loading = ref(true)

// 获取当前所处tab，并更新状态
const getNowTab = (val) => {
  nowTab.value = val.index
  placeholder.value = placeList[nowTab.value - 1]
  title.value = dialogList.find(item => item.tab === nowTab.value).title
  buttonText.value = dialogList.find(item => item.tab === nowTab.value).title
}

// 对话框相关
const showNormalResourceDialog = ref(false)
const showTagResourceDialog = ref(false)
const title = ref('上传普通资源')
const rId = ref()
const buttonText = ref('上传普通资源')
const dialogDes = ref()
const tagDeptId = ref()
const openDialog = () => {
  switch (buttonText.value) {
    case '上传普通资源':
      showNormalResourceDialog.value = true
      title.value = buttonText.value
      break
    case '创建资源标签':
      showTagResourceDialog.value = true
      title.value = buttonText.value
      break
  }

}
const closeNormalResource = async (obj) => {
  rId.value = null
  showNormalResourceDialog.value = obj.state
  dialogDes.value = obj.des
}
const closeTagResource = async (obj) => {
  deptId.value = null
  showTagResourceDialog.value = obj.state
  dialogDes.value = obj.des
  tagDeptId.value = obj.deptId || ''
}
const editNormal = (obj) => {
  showNormalResourceDialog.value = obj.showEdit
  title.value = obj.title
  rId.value = obj.rid
}


// 部门/分类标签选择相关
const selectVal = ref() // 选择值
const selectOptions = ref() // 选择列表
const getDeptListFromApi = async () => {
  loading.value = true
  const res = await getDeptList(1000, 0)
  if (res.code === 2002) {
    selectOptions.value = res.data.map(({id, deptName}) => ({value: id, label: deptName}))
  }
  loading.value = false
}
// 级联选择器动态搜索
const getSecondSelect = async (node, resolve) => {
  const {level} = node
  setTimeout(async () => {
    if (level === 1) {
      const res = await getResourceTagByDeptId(node.value)
      if (res.code === 2002) {
        selectOptions.value.find(item => item.value === node.value).children
            = res.data.map(({id, tagName}) => ({value: id, label: tagName}))
        selectOptions.value.find(item => item.value === node.value).children.forEach(item => {
          item.leaf = level >= 0;
        });
        resolve(selectOptions.value)
      } else {
        selectOptions.value.find(item => item.value === node.value).leaf = true
        selectOptions.value.find(item => item.value === node.value).disabled = true
      }
    } else {
      resolve([])
    }
  }, 1)
}
const customProps = {
  lazy: true,
  lazyLoad: getSecondSelect,
}
const deptId = ref()

// 搜索框相关
const keyword = ref()
const searchResultOffset = ref()
const searchByKeyword = async (val) => {
  if (val){
    searchResultOffset.value = 0
  }
}

onBeforeMount(async () => {
  await getDeptListFromApi()
})
</script>

<template>
  <tc-container-full-row style="height: 5vh">
    <el-menu
        :default-active="activeTab"
        mode="horizontal"
        active-text-color="#002fa7"
    >
      <el-menu-item index="1" @click="getNowTab">资源标签</el-menu-item>
      <el-menu-item index="2" @click="getNowTab">普通资源</el-menu-item>
      <el-menu-item index="3" @click="getNowTab">教材资源</el-menu-item>
    </el-menu>
  </tc-container-full-row>
  <br/><br/>
  <!--列表操作栏-->
  <div style="display: flex;flex-direction: column;height: 80vh;">
    <tc-container-full-row>
      <el-row :gutter="15">
        <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
          <tc-button-add @click="openDialog">{{ buttonText }}</tc-button-add>
        </el-col>
        <tc-dept-select
            v-if="nowTab === '1'"
            @get-dept-id-state="(state) => loading = state"
            @get-dept-id="(id) => deptId = id"/>
        <!--        部门/资源分类标签区域-->
        <el-cascader
            :options="selectOptions"
            :props="customProps"
            v-model="selectVal"
            v-if="nowTab==='2'"
            separator="&nbsp--&nbsp"
            placeholder="请选择部门和分类标签"
            clearable>
        </el-cascader>

        <!--      模糊搜索区域-->
        <el-col :xs="10" :sm="10" :md="10" :lg="10" :xl="10">
          <el-input v-model="keyword"
                    @input="searchByKeyword"
                    :prefix-icon="Search"
                    :placeholder="placeholder" clearable/>
        </el-col>
      </el-row>
    </tc-container-full-row>
    <br/>
    <!--    表格区域-->
    <admin-normal-resource
        v-if="nowTab === '2'"
        :select-val="selectVal"
        :search-keyword="keyword"
        :search-result-offset="searchResultOffset"
        :dialog-des="dialogDes"
        @edit="editNormal"/>
    <admin-tag-resource
        :dept-id="deptId"
        :dialog-des="dialogDes"
        :keyword="keyword"
        :tag-dept-id="tagDeptId"
        v-if="nowTab === '1'"/>
  </div>
  <admin-normal-resource-dialog :show-normal-resource-dialog="showNormalResourceDialog"
                                v-if="showNormalResourceDialog"
                                :title="title"
                                :rid="rId"
                                @close-normal-resource="closeNormalResource"/>
  <admin-tag-resource-dialog :show-tag-resource-dialog="showTagResourceDialog"
                             v-if="showTagResourceDialog"
                             :title="title"
                             @close-tag-resource="closeTagResource"/>
</template>

<style scoped>

</style>