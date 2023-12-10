<script setup>
import {onBeforeMount, ref} from "vue";
import AdminDeptDialog from "@/view/admin-view/dialog/AdminDeptDialog.vue";
import TcPagination from "@/components/container/tc-pagination.vue";
import {getDeptAccountByKeyword, getDeptList, getDeptMember} from "@/api/dept-api";
import {getUserAccountList1, getUserInfoByUid} from "@/api/user-api";
import {Plus, Search} from "@element-plus/icons-vue";


// 头部标签栏
const activeTab = ref('1')
const nowTab=ref('1')
const loading = ref(false)


const getNowTab = (val) => {
  nowTab.value = val.index
  loading.value = true
  getDeptListFromApi(0)
}


const title=ref()
//通过点击事件，改变属性
const showDeptDialog = ref(false)
//接收子类发送的事件，并改变（对话框显示）属性
const closeDialog = (val) => {
  showDeptDialog.value = val
}


const newDept = async (val) => {
  if(val){
   await getDeptListFromApi(0)
  }
}

const newMemberDept = async(val) => {
  if(val){
    await getDeptMemberList(dept_id.value,0)
    await getNewMemberNumber(1)
  }
}



const total = ref(0)
const dept_id = ref()
const uid = ref()
const deptInfoList = ref()



//用户列表
const userAccountList = ref([])
const getUserAccountListFromApi = async () => {
  const res = await getUserAccountList1('1', 0)
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



//查看部门详情
const deptMemberList = ref([])
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
const getDeptMemberList = async(m_deptId,offset=0) => {
  loading.value = true
  const res = await getDeptMember(m_deptId, 10, offset)
  if (res.code === 5005) {
    deptMemberList.value = []
  }else{
    loading.value = false
    total.value = res.total
    deptMemberList.value = res.data
  }
}


//模糊查询部门列表
const keyword = ref('')

const deptByKeyword = async (keyword) => {
  if (keyword.length !== 0 && keyword.replace(/\s/g, '') !== ''){
    loading.value = true
    const res = await getDeptAccountByKeyword(keyword, nowTab.value, 0)

    if (res.code === 5005){
      deptInfoList.value = []
    }else {
      total.value = res.total
      deptInfoList.value = res.data
    }
    await getUserAccountListFromApi()
    const promises = deptInfoList.value.map(async (item) => {
      const res = await getUserInfoByUid(item.headId);
      item.headId = res.data.realName;
    });
    await Promise.all(promises);
    loading.value = false
  }else {
    loading.value = true
    await getDeptListFromApi(0)
  }
}



// 模糊查询成员列表
const memberKeyword = ref('')

function matchText(a, b) {
  const regex = new RegExp(a, 'i');
  return regex.test(b);
}

const searchFunction = (searchList, memberKeyword) => {
  // 准备一个保存搜索结果的数据
  const result = ref([])
  // 直接从接口数据开始查询，
  searchList.find(item => {
    // 当用户的真实姓名和输入的关键词相等时
    if (matchText(memberKeyword, item.realName)){
      // 把匹配的数据，加入到结果集中
      result.value.push(item)
    }
  })
  return result.value
}
const isShowMemberPage = ref(true)
const memberByKeyword = async (memberKeyword) => {
  if (memberKeyword === ""){
    isShowMemberPage.value = true
    await getDeptMemberList(dept_id.value)
  }else {
    const res = await getDeptMember(dept_id.value, 10, 0)
    const resTotal = res.total
    loading.value = true;
    // 开始搜索
    let result = searchFunction(res.data, memberKeyword)
    if (result.length === 0){
      // 搜索不到相关信息
      let num = 10
      if (resTotal > 10){
        while (num <= resTotal) {
          const res = await getDeptMember(dept_id.value, 10, num);
          result = searchFunction(res.data, memberKeyword);
          num += 10;
        }
      }
    }

    // 表格中的数据，替换成搜索结果的数据
    deptMemberList.value = result
    isShowMemberPage.value = false
    loading.value = false;
    if (deptMemberList.value === []) {
      await getDeptListFromApi(0)
    }
  }
}





//分页器区域
const getNewPageNumber = (val) => {
  const offset = (val-1) * 10
  getDeptListFromApi(offset)
}



const getNewMemberNumber = (val) => {
  const offset = (val-1) * 10
  const m_deptId = dept_id.value
  getDeptMemberList(m_deptId,offset)
}




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
  <div style="height: 5vh;">
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
    </el-row>
  </div><br/>

<!--  部门展示栏-->
  <el-row >
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" >
    <el-table style="width: 100%;"
              :data="deptInfoList"
              :default-sort="{prop:'id',order:'descending'}"
              v-loading="loading" border
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
          <el-button size="small" type="primary" @click="() => {showDeptDialog= true; title='编辑部门';dept_id = scope.row.id}">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table><br/>

    <!--  分页器区域-->
      <el-row style="margin-top: auto;">
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" >
      <tc-pagination :total="total"
                     @page-current-change="getNewPageNumber"
                     style="position: fixed;bottom:5vh;left: 50%;
    "/>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
  </div>

<!--  查看部门详情-->
  <div v-if="showNewPage">
    <el-row style="height: 7.2vh">
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
      <div style="height: 5vh;">
        <el-row>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <slot/>
            <el-row :gutter="25">
              <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
                <el-button :icon="Plus" type="primary" color="#002fa7"  style="width: 100%" @click="() => {showDeptDialog = true; title = '新增成员'}">新增成员</el-button>
              </el-col>
              <el-col :xs="10" :sm="10" :md="10" :lg="10" :xl="10">
                  <el-input v-model="memberKeyword"
                            @input="memberByKeyword"
                            :prefix-icon="Search"
                            placeholder="请输入成员信息-关键词"/>
              </el-col>
            </el-row>
          </el-col>
        </el-row><br/>
      </div><br/>

<!--        部门成员列表-->
      <el-row>
        <el-table style="width: 100%;"
                  :data = "deptMemberList"
                  :default-sort="{prop:'id',order:'descending'}"
                  v-loading="loading" border
                  highlight-current-row stripe >
          <el-table-column type="index" fixed/>
          <el-table-column prop="id" label="成员ID"/>
          <el-table-column prop="realName" label="成员"/>
          <el-table-column prop="mobile" label="手机号码"/>

          <el-table-column label="操作" fixed="right">
            <template #default="scope">
              <el-button size="small" type="danger" @click="() => {
                showDeptDialog= true;
                title='删除成员';
                uid= scope.row.id}">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
  </div>

  <!--  分页器区域-->
  <el-row style="margin-top: auto;">
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <tc-pagination :total="total"
                     v-show="isShowMemberPage"
                     @page-current-change="getNewMemberNumber"
                     style="position: fixed;bottom: 5vh;left: 50%"/>
    </el-col>
  </el-row>




<!--  父类发给子类的事件，@子类发给父类-->
  <AdminDeptDialog :show-dept-dialog="showDeptDialog"
                   @close-dialog="closeDialog"
                   v-if="showDeptDialog"
                    @new-dept="newDept"
                   @new-member-dept="newMemberDept"
                   :title="title"
                   :uid="uid"
                   :dept_id="dept_id"></AdminDeptDialog>
</template>



<style scoped src="@/css/admin-user-manage.css">

</style>