<script setup>

import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {Search, Edit} from "@element-plus/icons-vue";
import TcButtonAdd from "@/components/button/tc-button-add.vue";
import {onBeforeMount, reactive, ref, watch} from "vue";
import AdminPlanDialog from "@/view/admin-view/dialog/AdminPlanDialog.vue";
import {withLoading} from "@/utils/functionUtil";
import {getDeptInfo} from "@/api/dept-api";
import TcPagination from "@/components/container/tc-pagination.vue";
import {getAllPlanByKeyword, getAllPlanList, getPlanListByDeptId} from "@/api/plan-api";
import TcDeptSelect from "@/components/select/tc-dept-select.vue";
import AdminPlanEditDialog from "@/view/admin-view/dialog/AdminPlanEditDialog.vue";
import {getPlanProgress} from "@/api/progress-api";
import {planStateConfig} from "@/config/globalConfig";

// 定义全局变量
const showPlanDialog = ref(false)
const showPlanEditDialog = ref(false)
const title = ref()
const keyword = ref()
const loading = ref(false)
const total = ref()
const nowDeptId = ref()
const showEmpty = ref(false)
const planState = {
  "timeout":"已逾期",
  "over":"已完成",
  "end":"已结束",
  "ongoing":"正在进行"
}

// 关闭对话框
const closeDialog = async (obj) => {
  showPlanDialog.value = obj.state
  if (obj.des.split("-")[0] === 'add'){
    await loadingDataList(0)
  }
}
const closeEditDialog = async (obj) => {
  showPlanEditDialog.value = obj.state
  if (obj.des.split("-")[0] === 'edit'){
    await loadingDataList(0)
  }
}

// 当搜索框的值发生变动时，触发搜索事件
const searchByKeyword = async (val) => {
  if (val){
    keyword.value = val
    await searchPlanByKeyword(val, 0)
  }else {
    await loadingDataList(0)
  }

}

// 数据列表初始化
const dataList = ref()
// 将部门ID替换为部门名，将抽象状态换为具体状态,将进度列表渲染其中
const dataListProcess = () => {
  return dataList.value.map(async (item) => {
    const deptResult = await getDeptInfo(item.dept_id)
    item.dept_id = deptResult.data.deptName
    item.training_state = planState[item.training_state]
    const progressResult = await getPlanProgress()
    progressResult.data.forEach((p) => {
      if(item.id === p['plan_id'] && typeof p['present'] !== "undefined"){
        item.progress = parseInt(String(p['present'] * 100))
      } else {
        item.progress = 0
      }
    })
  })
}

const loadingDataList = withLoading(async (offset) => {
  const res = await getAllPlanList(offset)
  if (res.code === 2002){
    showEmpty.value = false
    dataList.value = res.data
    total.value = res.total
    await Promise.all(dataListProcess())
  }else {
    showEmpty.value = true
  }
}, loading)
onBeforeMount(async ()=>{
  await loadingDataList(0)
})

// 触发分页器
const getNewPageNumber = async (val) => {
  const offset = (val-1) * 10
  if (keyword.value){
    await searchPlanByKeyword(keyword.value, offset)
  }else if (nowDeptId.value){
    await loadingPlanListByDeptId(nowDeptId.value, offset)
  }else {
    await loadingDataList(offset)
  }
}

// 模糊查询培训计划
const searchPlanByKeyword = withLoading(async (keyword, offset) => {
  const res = await getAllPlanByKeyword(keyword, offset)
  if (res.code === 2002){
    showEmpty.value = false
    dataList.value = res.data
    total.value = res.total
    await Promise.all(dataListProcess())
  }else {
    showEmpty.value = true
  }
}, loading)

// 获取指定部门的培训计划
const loadingPlanListByDeptId = withLoading(async (deptId, offset) => {
  const res = await getPlanListByDeptId(deptId, offset)
  if (res.code === 2002){
    showEmpty.value = false
    dataList.value = res.data.map(item => ({
      ...item.table,
      deptInfo: item.deptInfo
    }))
    total.value = res.total
    dataList.value.forEach((item) => {
      item.dept_id = item.deptInfo.dept_name
      item.training_state = planState[item.training_state]
    })
  }else {
    showEmpty.value = true
  }
}, loading)
watch(nowDeptId, async (newVal, oldVal) => {
  if (newVal !== oldVal && newVal){
    await loadingPlanListByDeptId(newVal, 0)
  }else {
    await loadingDataList(0)
  }
})

const basicInfo = reactive({
  training_plan_id:'',
  training_title:'',
  training_purpose:'',
  training_start_time:'',
  training_end_time:'',
  training_state:''
})
const edit = (item) => {
  showPlanEditDialog.value = true
  title.value = '编辑培训计划'
  basicInfo.training_plan_id = item.id
  basicInfo.training_title = item.training_title
  basicInfo.training_purpose = item.training_purpose
  basicInfo.training_start_time = item.training_start_time
  basicInfo.training_end_time = item.training_end_time
  basicInfo.training_state = Object.keys(planState).find(key => planState[key] === item.training_state)
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
  <div style="display: flex;flex-direction: column;height: 80vh;" v-loading="loading" >
    <tc-container-full-row>
      <el-row :gutter="15">
        <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
          <tc-button-add @click="() => {showPlanDialog = true; title = '定制培训计划'}">定制培训计划</tc-button-add>
        </el-col>
<!--        部门选择区域-->
        <tc-dept-select @get-dept-id="(deptId) => nowDeptId = deptId"/>
        <!--      模糊搜索区域-->
        <el-col :xs="10" :sm="10" :md="10" :lg="10" :xl="10">
          <el-input v-model="keyword"
                    @input="searchByKeyword"
                    :prefix-icon="Search"
                    clearable
                    placeholder="请输入培训计划相关信息" />
        </el-col>
      </el-row>
    </tc-container-full-row><br/>
<!--    培训计划列表区域-->
    <el-empty v-if="showEmpty" description="暂未制定培训计划"/>
    <el-row :gutter="15" style="height: 70vh;overflow-y: auto"  v-if="!showEmpty">
      <el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8" v-for="(item, index) in dataList" :key="index">
        <el-card shadow="never" style="position:relative;height: 300px;margin-bottom: 15px;border-radius: 0">
          <el-row>
            <el-col :xs="19" :sm="19" :md="19" :lg="19" :xl="19">
              <strong style="font-size: 1.3rem">{{item.training_title}}</strong>
            </el-col>
            <el-col :xs="5" :sm="5" :md="5" :lg="5" :xl="5" align="right">
              <el-button type="primary" :icon="Edit" circle size="small"
                         @click="edit(item)"/>
            </el-col>
          </el-row><br/>
          <tc-container-full-row>
            <el-tag type="info">{{item.dept_id}}</el-tag>
          </tc-container-full-row><br/>
          <tc-container-full-row>
            <div style="overflow-y: auto;height: 140px">
              <span style="font-weight: lighter;font-size: 0.9rem;">{{ item.training_purpose }}</span>
            </div>
          </tc-container-full-row><br/><br/>
          <div style="position:absolute;bottom: 0;margin-bottom: 10px;width: 100%">
            <el-row style="margin-bottom: 10px">
              <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                <el-progress style="margin-right: 10px" :percentage="item.progress"/>
              </el-col>
            </el-row>
            <el-row >
              <el-col :xs="5" :sm="5" :md="5" :lg="5" :xl="5" >
                <el-tag :type="planStateConfig.stateColor[planStateConfig.stateEN[item.training_state]]" style="font-size: 0.8rem;" round>{{ item.training_state }}</el-tag>
              </el-col>
              <el-col :xs="19" :sm="19" :md="19" :lg="16" :xl="19" align="right">
                <span style="font-size: 0.8rem;">{{ item.training_start_time }} ~ {{ item.training_end_time }}</span>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!--  分页器区域-->
    <tc-container-full-row style="margin-top: auto;">
      <tc-pagination v-if="!showEmpty" :total="total" @page-current-change="getNewPageNumber"/>
    </tc-container-full-row>

<!--    对话框区域-->
    <AdminPlanDialog :show-plan-dialog="showPlanDialog"
                     :title="title"
                     @close-dialog="closeDialog"/>
    <AdminPlanEditDialog :show-plan-edit-dialog="showPlanEditDialog"
                         :title="title" @close-edit-dialog="closeEditDialog" :basic-info="basicInfo"/>
  </div>
</template>

<!--suppress CssUnusedSymbol -->
<style scoped>
.el-pagination {
  justify-content: center;
}
</style>