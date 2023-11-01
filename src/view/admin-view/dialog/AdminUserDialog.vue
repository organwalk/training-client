<script setup>
import {defineProps, ref, watchEffect, defineEmits, reactive, onBeforeMount} from "vue"
import TcButtonConform from "@/components/button/tc-button-conform.vue";
import {
  createUserAccount,
  deleteAccountByUid,
  editUserAccountInfo,
  getAuthList,
  getUserAccountInfo
} from "@/api/user-api";
import {ElMessage} from "element-plus";
const props = defineProps({
  showUserDialog: Boolean,
  title:String,
  uid:Number,
  menuIndex:String

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
  password:'',
  real_name: '',
  mobile: '',
  auth_id:''
})
const rewritePassword = ref() // 是否重写密码

// 响应式更新添加、编辑用户账号对象
watchEffect(() => {
  addAccountInfo.username = accountInfo.username
  addAccountInfo.password = accountInfo.password
  addAccountInfo.real_name = accountInfo.real_name
  addAccountInfo.mobile = accountInfo.mobile

  if (rewritePassword.value){
    editAccountInfo.password = accountInfo.password
  }else {
    accountInfo.password = ''
    editAccountInfo.password = ''
  }
  editAccountInfo.real_name = accountInfo.real_name
  editAccountInfo.mobile = accountInfo.mobile
  editAccountInfo.auth_id = accountInfo.auth_id
});

// 从接口中获取认证信息列表
const authList = ref()
const getAuthListFromApi = async () => {
  const res = await getAuthList()
  loading.value = false
  if (res.code=== 5005){
    closeDialog()
  }else {
    accountInfo.auth_id = props.menuIndex
    authList.value = res.data
  }
}

// 添加用户
const addUser = async () => {
  const res = await createUserAccount(accountInfo)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    emit('newUser', true)
    closeDialog()
  }
}

// 从接口中获取用户账号信息
const getUserAccountInfoFromApi = async ()=>{
  loading.value = true
  const res = await getUserAccountInfo(props.uid)
  if (res.code=== 5005){
    closeDialog()
  }else {
    accountInfo.real_name = res.data.realName
    accountInfo.mobile = res.data.mobile
    editAccountInfo.auth_id = res.data.auth.id
    accountInfo.auth_id = editAccountInfo.auth_id
  }
}

// 编辑用户
const editUser = async () => {
  loading.value = true
  const res = await editUserAccountInfo(props.uid, editAccountInfo)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    emit('newUser', true)
    closeDialog()
  }
}

// 删除用户
const deleteUser = async () => {
  loading.value = true
  const res = await deleteAccountByUid(props.uid)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    emit('newUser', true)
    closeDialog()
  }
}

// 组件挂载前的动作
onBeforeMount(()=>{
  getAuthListFromApi()
  if (props.title === '编辑用户'){
    getUserAccountInfoFromApi()
    rewritePassword.value = false
  }else {
    rewritePassword.value = true
  }
})

// 检查表单信息是否完整
const checkFormObjFull = (obj) => {
  if (!rewritePassword.value){
    return Object.keys(obj).some(key => key !== 'password' && !obj[key])
  }else {
    return Object.keys(obj).some(key => !obj[key])
  }
}
</script>

<template>
  <el-dialog v-model="showUserDialog"
             :title="props.title"
             width="30%"
             destroy-on-close
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :before-close="closeDialog"
             :show-close="!loading"

  >
    <el-form :model="accountInfo" label-width="70px" v-loading="loading" v-if="props.title !== '删除用户'">
      <el-form-item label="用户名称" v-if="props.title === '新增用户'">
        <el-input v-model="accountInfo.username"
                  onkeyup="this.value = this.value.replace(/[^a-zA-Z0-9]+$/, '')"
                  placeholder="请输入用户名，仅英文和数字" />
      </el-form-item>
      <el-form-item label="账号密码">
        <el-switch v-model="rewritePassword" v-if="props.title !== '新增用户'" />
        <el-input v-model="accountInfo.password"
                  placeholder="请输入密码" type="password" minlength="6"
                  :disabled="!rewritePassword"
                  show-password show-word-limit/>
      </el-form-item>
      <el-form-item label="真实姓名">
        <el-input v-model="accountInfo.real_name"
                  placeholder="请输入中文形式的真实姓名" minlength="2"/>
      </el-form-item>
      <el-form-item label="手机号码">
        <el-input v-model="accountInfo.mobile"
                  onkeyup="this.value = this.value.replace(/[^0-9]+$/, '')"
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
    <span v-if="props.title ==='删除用户'">是否确认删除此用户？该操作不可撤回</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog" :disabled="loading">取消</el-button>
        <tc-button-conform @click="addUser" v-if="props.title === '新增用户'"
                           :disabled="checkFormObjFull(addAccountInfo)" v-btn>
          添加</tc-button-conform>
        <tc-button-conform @click="editUser" v-if="props.title === '编辑用户'"
                           :disabled="checkFormObjFull(editAccountInfo)" v-btn>
          确认编辑</tc-button-conform>
        <tc-button-conform v-if="props.title === '删除用户'"
                           :loading="loading"
                           @click="deleteUser">
          确认删除
        </tc-button-conform>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>