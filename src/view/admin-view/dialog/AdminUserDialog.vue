<script setup>
import {defineProps, ref, watchEffect, defineEmits, reactive, onMounted} from "vue"
import TcButtonConform from "@/components/button/tc-button-conform.vue";
import {createUserAccount, getAuthList, getUserAccountInfo} from "@/api/user-api";
import {ElMessage} from "element-plus";
const props = defineProps({
  showUserDialog: Boolean,
  title:String,
  uid:Number
})

const loading = ref(true)
// 控制对话框显隐
const emit = defineEmits(['closeDialog', 'newUser'])
const showUserDialog = ref()
watchEffect(()=>{
  showUserDialog.value = props.showUserDialog
})
const closeDialog = () => {
  showUserDialog.value = false
  emit('closeDialog', false)
}

// 创建用户对象及方法
const accountInfo = reactive({
  username:'',
  password:'',
  real_name:'',
  mobile:'',
  auth_id:''
})

// 定义添加用户账号对象
const addAccountInfo = reactive({
  username: '',
  password: '',
  real_name: '',
  mobile: '',
});

// 定义编辑用户账号对象
const editAccountInfo = reactive({
  password: '',
  real_name: '',
  mobile: '',
  auth_id:''
})

watchEffect(() => {
  addAccountInfo.username = accountInfo.username
  addAccountInfo.password = accountInfo.password
  addAccountInfo.real_name = accountInfo.real_name
  addAccountInfo.mobile = accountInfo.mobile

  editAccountInfo.password = accountInfo.password
  editAccountInfo.real_name = accountInfo.real_name
  editAccountInfo.mobile = accountInfo.mobile
  editAccountInfo.auth_id = accountInfo.auth_id
});

const authList = ref()
const getAuthListFromApi = async () => {
  const res = await getAuthList()
  loading.value = false
  if (res.code=== 5005){
    closeDialog()
  }else {
    accountInfo.auth_id = res.data.find(item => item.authName === "none").id
    authList.value = res.data
  }
}
const addUser = async () => {
  const res = await createUserAccount(accountInfo)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    emit('addNewUser', true)
    closeDialog()
  }
}

const getUserAccountInfoFromApi = async ()=>{
  const res = await getUserAccountInfo(props.uid)
  if (res.code=== 5005){
    closeDialog()
  }else {
    accountInfo.password = res.data.password
    accountInfo.real_name = res.data.real_name
    accountInfo.mobile = res.data.mobile
    editAccountInfo.auth_id = res.data.auth.id
    accountInfo.auth_id = editAccountInfo.auth_id
  }
}

onMounted(()=>{
  getAuthListFromApi()
  if (props.title === '编辑用户'){
    getUserAccountInfoFromApi()
  }
})
</script>

<template>
  <el-dialog v-model="showUserDialog"
             v-loading="loading"
             :title="props.title"
             width="30%"
             destroy-on-close
             :close-on-click-modal="false"
             :before-close="closeDialog"
  >
    <el-form :model="accountInfo" label-width="70px">
      <el-form-item label="用户名称" v-if="props.title === '新增用户'">
        <el-input v-model="accountInfo.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="账号密码">
        <el-input v-model="accountInfo.password"
                  placeholder="请输入密码" type="password" minlength="6" show-password show-word-limit/>
      </el-form-item>
      <el-form-item label="真实姓名">
        <el-input v-model="accountInfo.real_name" placeholder="请输入真实姓名" minlength="2"/>
      </el-form-item>
      <el-form-item label="手机号码">
        <el-input v-model="accountInfo.mobile"
                  placeholder="请输入手机号码" maxlength="11" minlength="11"/>
      </el-form-item>
      <el-form-item label="身份权限" v-if="props.title !== '新增用户'">
        <el-radio-group v-model="accountInfo.auth_id">
          <el-radio v-for="(item, index) in authList" :key="index" :label="item.id">
            <el-tag round>{{item.authName}}</el-tag>
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <tc-button-conform @click="addUser" v-if="props.title === '新增用户'"
                           :disabled="Object.keys(addAccountInfo).some(key => !addAccountInfo[key])" v-btn>
          添加</tc-button-conform>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>