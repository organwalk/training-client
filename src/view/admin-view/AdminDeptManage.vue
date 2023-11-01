<script setup>
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import TcButtonAdd from "@/components/button/tc-button-add.vue";
import {onBeforeMount, ref} from "vue";
import AdminDeptDialog from "@/view/admin-view/dialog/AdminDeptDialog.vue";
import TcPagination from "@/components/container/tc-pagination.vue";
import {getDeptList } from "@/api/dept-api";



const activeTab = ref('1')
const nowTab=ref('1')

const getNowTab = (val) => {
  nowTab.value = val.index
  getDeptListFromApi(0)
}

const title=ref()
//通过点击事件，改变属性
const showDeptDialog = ref(false)
//接收子类发送的事件，并改变（对话框显示）属性
const closeDialog = (val) => {
  showDeptDialog.value = val
}

const newDept = (val) => {
  if(val){
    getDeptListFromApi(0)
  }
}

const deptInfoList = ref([])
const total = ref()
const dept_id = ref()



const getDeptListFromApi = async (offset) =>{
  const res = await getDeptList(10,offset)
  if(res.code === 5005) {
    deptInfoList.value = []
  }{
      total.value = res.total
      deptInfoList.value = res.data
    }
}

const getNewPageNumber = (val) => {
  const offset = (val-1) * 10
  getDeptListFromApi(offset)
}


// const selectVal = ref()
// const selectOptions = ref()
// const getUserAccountListFromApi = async () => {
//   const res = await getUserAccountList(1000 , 0)
//   if (res.code === 2002) {
//     selectOptions.value = res.data.map(({auth_id}) => auth_id === 1 )
//     selectOptions.value = res.data.map(({id}) => ({value:id}))
//   }
// }

onBeforeMount(() => {
  getDeptListFromApi(0)
  // getUserAccountListFromApi()
})
</script>

<template>
<!--  头部标签栏-->
  <tc-container-full-row>
    <el-menu
        :default-active="activeTab"
        mode="horizontal"
        active-text-color="#002fa7"
    >
      <el-menu-item index="1" @click="getNowTab">部门列表</el-menu-item>
    </el-menu>
  </tc-container-full-row><br/>
<!--  新增部门栏-->
  <div style="height: 5vh;overflow-y: auto">
  <tc-container-full-row>
    <el-row :gutter="25">
      <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
        <tc-button-add @click="() => {showDeptDialog = true; title = '新增部门'}">新增部门</tc-button-add>
      </el-col>
      <el-col :xs="10" :sm="10" :md="10" :lg="10" :xl="10">
        <el-input/>
      </el-col>
    </el-row>
  </tc-container-full-row><br/>
  </div>
<!--  部门展示栏-->
  <tc-container-full-row>
    <el-table style="width: 100%;" :data="deptInfoList" :default-sort="{prop:'id',order:'descending'}" highlight-current-row stripe >
      <el-table-column type="index" fixed/>
      <el-table-column prop="id" label="部门DID" sortable/>
      <el-table-column prop="deptName" label="部门名称"/>
      <el-table-column prop="headId" label="负责人ID">

      </el-table-column>

      <el-table-column label="操作" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="() => {showDeptDialog= true; title='查看部门'; dept_id = scope.row.id}">
            查看
          </el-button>
          <el-button size="small" @click="() => {showDeptDialog= true; title='编辑部门';dept_id = scope.row.id}">
            编辑
          </el-button>
          <el-button size="small" type="danger" @click="() => {showDeptDialog= true; title='删除部门'; dept_id = scope.row.id}">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table><br/>
    <!--  分页器区域-->
    <tc-container-full-row>
      <tc-pagination :total="total" @page-current-change="getNewPageNumber"/>
    </tc-container-full-row>
  </tc-container-full-row>

<!--  父类发给子类的事件，@子类发给父类-->
  <AdminDeptDialog :show-dept-dialog="showDeptDialog"
                   @close-dialog="closeDialog"
                   v-if="showDeptDialog"
                    @new-dept="newDept"
                   :title="title" :dept_id="dept_id"  ></AdminDeptDialog>
</template>

<style scoped src="@/css/admin-user-manage.css">

</style>