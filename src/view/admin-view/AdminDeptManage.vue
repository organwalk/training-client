<script setup>
import {onBeforeMount, ref} from "vue";
import AdminDeptDialog from "@/view/admin-view/dialog/AdminDeptDialog.vue";
import TcPagination from "@/components/container/tc-pagination.vue";
import {getDeptList,
        getDeptMember,
        getDeptAccountByKeyword} from "@/api/dept-api";
import {getUserAccountList,
        getUserInfoByUid} from "@/api/user-api";
import {Plus, Search} from "@element-plus/icons-vue";



// 头部标签栏
const activeTab = ref('1')
const nowTab=ref('1')
const loading = ref(false)


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


const deptInfoList = ref()
const total = ref()
const dept_id = ref()

const uid = ref()


//用户列表
const userAccountList = ref([])
const getUserAccountListFromApi = async () => {
  const res = await getUserAccountList('1', 0)
  if (res.code === 2002) {
    userAccountList.value = res.data.map(({id, realName }) => ({uid:id , label:realName }))
  }
}


// 获取部门列表
const getDeptListFromApi = async (offset) =>{
  loading.value = true
  const res = await getDeptList(10,offset)
  if(res.code === 5005) {
    deptInfoList.value = [];
  }else{
    total.value = res.total;
    deptInfoList.value = res.data
    const promises = deptInfoList.value.map(async (item) => {
      const res = await getUserInfoByUid(item.headId);
      item.headId = res.data.realName;
    });
    await Promise.all(promises);
  }
  loading.value = false
}




const deptMemberList = ref([])

//查看部门详情
const handleViewDept = async (dept_id) => {
  viewDept(dept_id)
  await getDeptMemberList(dept_id)
}


const showOldPage = ref(true)
const showNewPage = ref(false)
const viewDept= (v_dept_id)=>{
  showOldPage.value = false
  showNewPage.value = true
  dept_id.value = v_dept_id
}
const putDept = () =>{
  showOldPage.value = true;
  showNewPage.value = false;
}



//获取指定部门--成员列表
const getDeptMemberList = async(m_deptId) => {
  const res = await getDeptMember(m_deptId, 10, 0)
  if (res.code === 5005) {
    deptMemberList.value = []
  }else{
    total.value = res.total
    deptMemberList.value = res.data
  }
}


//模糊查询部门列表
const keyword = ref('')

const deptByKeyword = async (keyword) => {

}




//分页器区域
const getNewPageNumber = (val) => {
  const offset = (val-1) * 10
  getDeptListFromApi(offset)
}


//父类发给子类的事件，@子类发给父类
onBeforeMount(() => {
  getDeptListFromApi(0)
  getUserAccountListFromApi()
})


</script>

<template>
<!--  头部标签栏-->
  <div v-if="showOldPage">
    <el-row style="height: 7.2vh">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
    <el-menu
        :default-active="activeTab"
        mode="horizontal"
        active-text-color="#002fa7"
    >
      <el-menu-item index="1" @click="putDept;getNowTab;">部门列表</el-menu-item>
    </el-menu>
      </el-col>
    </el-row><br/>


<!--  新增部门栏-->
  <div style="height: 5vh;overflow-y: auto">
    <el-row>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
    <el-row :gutter="15">
      <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
        <el-button :icon="Plus" type="primary" color="#002fa7"  style="width: 100%" @click="() => {showDeptDialog = true; title = '新增部门'}">新增部门</el-button>
      </el-col>
      <el-col :xs="10" :sm="10" :md="10" :lg="10" :xl="10">
        <el-input v-model="keyword"
                  @input="deptByKeyword"
                  :prefix-icon="Search"
                  placeholder="请输入部门信息-关键词"/>
      </el-col>
    </el-row>
      </el-col>
    </el-row><br/>
  </div>


<!--  部门展示栏-->
  <el-row >
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" >
    <el-table style="width: 100%;"
              :data="deptInfoList"
              :default-sort="{prop:'id',order:'descending'}"
              v-loading="loading"
              highlight-current-row stripe >
      <el-table-column type="index" fixed/>
      <el-table-column prop="id" label="部门DID" sortable/>
      <el-table-column prop="deptName" label="部门名称"/>
      <el-table-column prop="headId" label="负责人"/>

      <el-table-column label="操作" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleViewDept(scope.row.id )">
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
      <el-row>
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <slot/>
      <tc-pagination :total="total" @page-current-change="getNewPageNumber"/>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
  </div>




<!--  查看部门详情-->
  <div v-if="showNewPage">
    <el-row>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-button @click="putDept"
                   text  color="#FFFFFF"  style="width: 6.4% ; height: 6vh; color:#002fa7;border: none;
        border-bottom: 2px solid #002fa7; border-radius: 0;"
                    >返回列表
        </el-button>
      </el-col>
    </el-row>
    <br/>


<!--      新增成员-->
      <div style="height: 5vh;overflow-y: auto">
        <el-row>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <slot/>
            <el-row :gutter="25">
              <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
                <el-button :icon="Plus" type="primary" color="#002fa7"  style="width: 100%" @click="() => {showDeptDialog = true; title = '新增成员'}">新增成员</el-button>
              </el-col>
              <el-col :xs="10" :sm="10" :md="10" :lg="10" :xl="10">
                <el-input/>
              </el-col>
            </el-row>
          </el-col>
        </el-row><br/>
      </div>

<!--        部门成员列表-->
      <el-row>
        <el-table style="width: 100%;"
                  :data = "deptMemberList"
                  :default-sort="{prop:'id',order:'descending'}"
                  v-loading="loading"
                  highlight-current-row stripe >
          <el-table-column type="index" fixed/>
          <el-table-column prop="id" label="成员ID"/>
          <el-table-column prop="realName" label="成员"/>
          <el-table-column prop="mobile" label="手机号码"/>

          <el-table-column label="操作" fixed="right">
            <template #default="scope">
              <el-button size="small" type="danger" @click="() => {showDeptDialog= true; title='删除成员'; dept_id = scope.row.id; uid= scope.row.id}">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>

      <!--  分页器区域-->
      <el-row>
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <slot/>
          <tc-pagination :total="total" @page-current-change="getNewPageNumber"/>
        </el-col>
      </el-row>

  </div>




<!--  父类发给子类的事件，@子类发给父类-->
  <AdminDeptDialog :show-dept-dialog="showDeptDialog"
                   @close-dialog="closeDialog"
                   v-if="showDeptDialog"
                    @new-dept="newDept"
                   :title="title" :dept_id="dept_id"></AdminDeptDialog>
</template>



<style scoped src="@/css/admin-user-manage.css">

</style>