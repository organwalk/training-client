<script setup>

import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {onBeforeMount, ref, watchEffect} from "vue";
import {Search} from "@element-plus/icons-vue";
import TcButtonAdd from "@/components/button/tc-button-add.vue";
import {getDeptList} from "@/api/dept-api";
import {
  deleteNormalResource,
  downloadResource,
  getNormalResource,
  getNormalResourceByDeptIdAndTagId,
  getResourceTagByDeptId,
  selectNormalResourceByKeyword
} from "@/api/resource-api";
import TcPagination from "@/components/container/tc-pagination.vue";
import AdminNormalResourceDialog from "@/view/admin-view/dialog/AdminNormalResourceDialog.vue";
import {ElMessage} from "element-plus";

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
const title = ref('上传普通资源')
const buttonText = ref('上传普通资源')
const closeNormalResource = async (val) => {
  rId.value = null
  showNormalResourceDialog.value = val
  if (selectVal.value !== undefined && selectVal.value !== null){
    await getNormalResourceList(0)
  }else {
    await getAllNormalResourceList(0)
  }
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


// 搜索框相关
const keyword = ref()
const selectNormalResourceByKeywordFromApi = async (val, offset) => {
  loading.value = true
  if (val){
    const res = await selectNormalResourceByKeyword(val, offset, deptId.value, tagId.value)
    if (res.code === 2002){
      dataList.value = res.data
      total.value = res.total
    }
  }else {
    if (selectVal.value[0] === undefined){
      await getAllNormalResourceList(offset)
    }else {
      await getNormalResourceList(offset)
    }
  }
  loading.value = false

}
const searchByKeyword = async (val) => {
  keyword.value = val
  await selectNormalResourceByKeywordFromApi(val, 0)
}

// 表格相关
const dataList = ref([])
const total = ref()
const getAllNormalResourceList = async (offset) => {
  loading.value = true
  const res = await getNormalResource(offset)
  if (res.code === 2002){
    total.value = res.total
    dataList.value = res.data
  }else {
    dataList.value = []
  }
  loading.value = false
}
const deptId = ref()
const tagId = ref()
const getNormalResourceList = async (offset)=> {
  deptId.value = selectVal.value[0]
  tagId.value = selectVal.value[1]
  loading.value = true
  const res = await getNormalResourceByDeptIdAndTagId(deptId.value, tagId.value, offset)
  if (res.code === 2002){
    total.value = res.total
    dataList.value = res.data
  }else {
    dataList.value = []
  }
  loading.value = false
}
watchEffect(async ()=>{
  if (selectVal.value !== undefined && selectVal.value !== null){
    await getNormalResourceList(0)
  }else {
    await getAllNormalResourceList(0)
  }
})
const rId = ref()

// 获取新的页数
const getNewPageNumber = async (val) => {
  const offset = (val-1) * 10
  if (keyword.value){
    await selectNormalResourceByKeywordFromApi(keyword.value, offset)
  }else {
    if (selectVal.value[0] === undefined){
      await getAllNormalResourceList(offset)
    }else {
      await getNormalResourceList(offset)
    }
  }
}

// 删除指定资源
const deleteNormalResourceFromApi = async (rid) => {
  loading.value = true
  const res = await deleteNormalResource(rid, sessionStorage.getItem("uid"))
  if (res.code === 2002){
    dataList.value.splice(dataList.value.findIndex(item => item.id === rid), 1)
    ElMessage.success(res.msg)
  }
  loading.value = false
}

onBeforeMount(async () => {
  await getDeptListFromApi()
  await getAllNormalResourceList(0)
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
          <tc-button-add @click="showNormalResourceDialog = true; title='上传普通资源'">{{ buttonText }}</tc-button-add>
        </el-col>

        <!--        部门/资源分类标签区域-->
        <el-cascader v-model="selectVal"
                     separator="&nbsp--&nbsp"
                     :options="selectOptions"
                     placeholder="请选择部门和分类标签"
                     clearable
                     :props="customProps">
        </el-cascader>

        <!--      模糊搜索区域-->
        <el-col :xs="10" :sm="10" :md="10" :lg="10" :xl="10">
          <el-input v-model="keyword"
                    @input="searchByKeyword"
                    :prefix-icon="Search"
                    :placeholder="placeholder" clearable/>
        </el-col>
      </el-row>
    </tc-container-full-row><br/>
    <!--    表格区域-->
    <tc-container-full-row>
      <el-table :data="dataList" v-loading="loading" height="450">
        <el-table-column type="index" fixed/>
        <el-table-column prop="id" label="资源RID" sortable/>
        <el-table-column prop="resource_name" label="资源名称"/>
        <el-table-column prop="deptInfo.dept_name" label="所属部门"
                         v-if="dataList.length !== 0 && dataList[0].hasOwnProperty('deptInfo')"/>
        <el-table-column prop="tagInfo.tag_name" label="分类标签"
                         v-if="dataList.length !== 0 && dataList[0].hasOwnProperty('tagInfo')"/>
        <el-table-column prop="upInfo.realName" label="上传者"/>
        <el-table-column prop="up_datetime" label="上传时间"/>
        <el-table-column label="操作" fixed="right" min-width="110">
          <template #default="scope">
            <el-button size="small"
                       @click="() => {
                         showNormalResourceDialog = true;
                         rId = scope.row.id;
                         title = '编辑资源详细'}"
            >
              编辑</el-button>
            <el-button size="small" type="primary" @click="downloadResource(scope.row.id)">下载</el-button>
            <el-button size="small" type="danger" @click="deleteNormalResourceFromApi(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </tc-container-full-row><br/>
    <!--  分页器区域-->
    <tc-container-full-row style="margin-top: auto;">
      <tc-pagination :total="total" @page-current-change="getNewPageNumber"/>
    </tc-container-full-row>
  </div>
  <admin-normal-resource-dialog :show-normal-resource-dialog="showNormalResourceDialog"
                                v-if="showNormalResourceDialog"
                                :title="title"
                                :rid="rId"
                                @close-normal-resource="closeNormalResource"/>
</template>

<style scoped>
.el-pagination {
  justify-content: center;
}
</style>