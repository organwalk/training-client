<script setup>
import {defineProps, defineEmits, ref, watchEffect, reactive, onBeforeMount, } from 'vue'
import {deleteDeptByDept_id,
  editDeptInfo,
  getDeptInfo,
  addDeptMember,
  creatDeptAccount,
  deleteDeptMember} from "@/api/dept-api";
import {getUserAccountList1} from "@/api/user-api";
import {ElMessage} from "element-plus";


const loading = ref(false)
//定义从父类那接收的变量
const props = defineProps({
  showDeptDialog: Boolean,
  title: String,
  dept_id: Number,
  uid: Number,
  showNewPage: Boolean
})


//从父类那接收数据（控制对话框显示和消失）
const showDeptDialog = ref()
watchEffect(() => {
  showDeptDialog.value = props.showDeptDialog
})
//emit，指定一个事件发送给父类
const emit = defineEmits(['closeDialog', 'newDept' , 'newMemberDept' ])
const closeDialog = () => {
  showDeptDialog.value = false
  emit('closeDialog', false)
}


//定义部门对象
const deptInfo = reactive({
  uid:'',
  id: '',
  deptName: '',
  headId: '',
  dept_id: '',
  deptId:'',
  authId: '',
  auth_id: '',
  realName:'',
  real_name:'',
  dept_name:''
})




//添加部门
const addDept = async () => {
  let obj = {
    'dept_name':deptInfo.deptName,
    'head_id':deptInfo.headId,
    'real_name':deptInfo.real_name
  }
  const res = await creatDeptAccount(obj)
  if (res.code === 2002) {
    ElMessage.success((res.msg))
    emit('newDept', true)
    closeDialog()
    //刷新页面（二）
    // location.reload();
  }
}


//获取指定部门列表信息
const getDeptInfoFromApi = async () =>{
  const res = await getDeptInfo(props.dept_id)
  if (res.code === 5005){
    closeDialog()
  }else{
    deptInfo.dept_name = res.data.deptName
    deptInfo.head_id = res.data.headId
  }
}


//编辑部门,只提取部门列表的负责人id和部门名称
const editDept = async () => {
  loading.value = true
  let obj = {
    'dept_name':deptInfo.dept_name,
    'head_id':deptInfo.head_id
  }
  const res = await editDeptInfo(props.dept_id,obj)
  if(res.code === 2002) {
    ElMessage.success(res.msg)
    emit('newDept', true)
    closeDialog()
  }
  loading.value = false
}


//删除部门
const deleteDept = async () => {
  const res = await deleteDeptByDept_id(props.dept_id)
  if (res.code === 2002) {
    ElMessage.success(res.msg)
    emit('newDept', true)
    closeDialog()
  }

}


// 添加部门成员
const addDeptPeople = async () => {
  let obj = {
    'dept_id': props.dept_id,
    'uid':deptInfo.uid
  }
  const res = await addDeptMember(obj)
  if (res.code === 2002) {
    ElMessage.success(res.msg)
    emit('newMemberDept', true)
    closeDialog()
  }
}



//删除部门成员
const deleteDeptPeople = async () => {
  console.log(props.uid)
  const res = await deleteDeptMember(props.dept_id, props.uid)
  if (res.code === 2002) {
    ElMessage.success(res.msg)
    emit('newMemberDept', true)
    closeDialog()
  }
}


//获取用户列表
const userAccountList = ref()
const getUserAccountListFromApi = async () => {
    const res = await getUserAccountList1('1', 0)
    if (res.code === 2002) {
      userAccountList.value = res.data.map(({id, realName}) => ({value: id, label: realName}))
    }
}




// 解释器执行之前
onBeforeMount(() => {
  getUserAccountListFromApi()
  if (props.title === '编辑部门') {
    getDeptInfoFromApi()
  }
})


</script>

<template>
  <el-dialog v-model="showDeptDialog"
             :before-close="closeDialog"
             width="30%"
             :title="props.title"
             destroy-on-close
  >
    <el-form :model="deptInfo" label-width="70px" >
<!--      新增部门-->
      <el-form-item label="部门名称" v-if="props.title === '新增部门'">
        <el-input placeholder="请输入部门名称"
                  v-model="deptInfo.deptName"/>
      </el-form-item>
      <el-form-item label="负责人" v-if="props.title === '新增部门'">
        <el-select v-model="deptInfo.headId"
                   placeholder="需要一位负责人"
                   filterable>
          <el-option v-for="item in userAccountList"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"/>
        </el-select>
      </el-form-item>

<!--        编辑部门-->
      <el-form-item v-if="props.title === '编辑部门'" label="部门名称">
        <el-input v-model="deptInfo.dept_name"
                  placeholder="请输入部门名称"
                  minlength="2">

        </el-input>
      </el-form-item>
    <el-form-item v-if="props.title === '编辑部门'" label="负责人">
        <el-select v-model="deptInfo.head_id"
                   placeholder="需要一位负责人"
                   filterable
                   @change="getUserAccountListFromApi">
          <el-option v-for="item in userAccountList"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"/>
        </el-select>
      </el-form-item>


<!--      新增成员-->
      <el-form-item v-if="props.title === '新增成员'" label="部门成员">
        <el-select v-model="deptInfo.uid"
                   placeholder="需要-部门成员"
                   filterable>
          <el-option v-for="item in userAccountList"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"/>
        </el-select>
      </el-form-item>

    </el-form>
    <span v-if="props.title ==='删除部门'">是否确认删除此部门？该操作不可撤回</span>

    <span v-if="props.title ==='删除成员'">是否确认删除此成员？该操作不可撤回</span>

    <template #footer>
  <span class="dialog-footer">
    <el-button @click="closeDialog">取消</el-button>

    <el-button type="primary" color="#002fa7" :loading="props.loading" @click="addDept" v-if="props.title ==='新增部门'">
      添加
    </el-button>

    <el-button type="primary" color="#002fa7" :loading="props.loading" @click="editDept" v-if="props.title === '编辑部门'">
      确定编辑
    </el-button>

    <el-button type="primary" color="#002fa7" :loading="props.loading" @click="deleteDept" v-if="props.title ==='删除部门'">
      确定删除
    </el-button>

    <el-button type="primary" color="#002fa7" :loading="props.loading" @click="addDeptPeople()" v-if="props.title ==='新增成员'">
      添加
    </el-button>

    <el-button type="primary" color="#002fa7" :loading="props.loading" @click="deleteDeptPeople()" v-if="props.title ==='删除成员'">
      确定删除
    </el-button>

  </span>
    </template>

  </el-dialog>
</template>



<style scoped>

</style>