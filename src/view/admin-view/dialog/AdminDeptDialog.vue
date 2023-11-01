<script setup>
import {defineProps, defineEmits, ref, watchEffect, reactive, onBeforeMount,} from 'vue'
import {creatDeptAccount} from "@/api/dept-api";
import {deleteDeptByDept_id} from "@/api/dept-api";
import {getUserAccountList} from "@/api/user-api";
import {ElMessage} from "element-plus";
import TcButtonConform from "@/components/button/tc-button-conform.vue";


//定义从父类那接收的变量
const props = defineProps({
  showDeptDialog: Boolean,
  title: String,
  dept_id: Number
})


//从父类那接收数据（控制对话框显示和消失）
const showDeptDialog = ref()
watchEffect(() => {
  showDeptDialog.value = props.showDeptDialog
})
//emit，指定一个事件发送给父类
const emit = defineEmits(['closeDialog', 'newDept'])
const closeDialog = () => {
  showDeptDialog.value = false
  emit('closeDialog', false)
}


//定义部门对象
const deptInfo = reactive({
  uid: '',
  id: '',
  deptName: '',
  headId: '',
  dept_id: '',
  authId: '',
  auth_id: '',
  realName:'',
  real_name:''
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
  }
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

const userAccountList = ref([])
const getUserAccountListFromApi = async () => {
  const res = await getUserAccountList('1', 0)
  if (res.code === 2002) {
    userAccountList.value = res.data.map(({id , realName}) => ({value: id, label:realName}))
  }
}


onBeforeMount(() => {
  getUserAccountListFromApi()
})


</script>

<template>
  <el-dialog v-model="showDeptDialog"
             :before-close="closeDialog"
             width="30%"
             :title="props.title"
  >
    <el-form :model="deptInfo" label-width="70px" v-if="props.title !== '删除部门'">
      <el-form-item label="部门名称" v-if="props.title === '新增部门'">
        <el-input placeholder="请输入部门名称"
                  v-model="deptInfo.deptName"
        />
      </el-form-item>
      <el-form-item label="负责人ID" v-if="props.title === '新增部门'">
        <el-select v-model="deptInfo.headId"
                   placeholder="需要一位负责人"
                   filterable
        >
          <el-option v-for="item in userAccountList"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"/>
        </el-select>
      </el-form-item>

      <el-form-item label="负责人ID" v-if="props.title === '查看部门'">

      </el-form-item>

    </el-form>
    <span v-if="props.title ==='删除部门'">是否确认删除此部门？该操作不可撤回</span>

    <template #footer>
  <span class="dialog-footer">
    <el-button @click="closeDialog">取消</el-button>
    <tc-button-conform @click="addDept" v-if="props.title ==='新增部门'">
      添加
    </tc-button-conform>
    <tc-button-conform @click="deleteDept" v-if="props.title ==='删除部门'">
      确定删除
    </tc-button-conform>
  </span>
    </template>

  </el-dialog>


</template>


<style scoped>

</style>