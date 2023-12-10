<script setup>
import {Close} from "@element-plus/icons-vue";
import {defineEmits, defineProps, ref, watchEffect} from "vue";
import {getUserInfoByUid, updateUserAccountInfo} from "@/api/user-api";
import {withLoading} from "@/utils/functionUtil";
import {ElMessage} from "element-plus";

const props = defineProps({
  dialog: Boolean,
})
const emit = defineEmits(['close'])
const dialog = ref(false)

const loading = ref(false)
const uid = ref(sessionStorage.getItem("uid"))
const username = ref(sessionStorage.getItem("username"))
const authName = ref(sessionStorage.getItem("auth_name"))
const realName = ref()
const mobile = ref()
const originMobile = ref()
const password = ref('')
const authMap = {
  "admin":"管理员",
  "teacher":"讲师",
  "none":"员工"
}
const loadingUserInfo = withLoading(async () => {
  const res = await getUserInfoByUid(sessionStorage.getItem("uid"))
  if (res.code === 2002){
    realName.value = res.data.realName
    mobile.value = res.data.mobile
    originMobile.value = res.data.mobile
  }
}, loading)


watchEffect(async () => {
  if (props.dialog) {
    dialog.value = props.dialog
    await loadingUserInfo()
  }
})
const closeDialog = (des) => {
  dialog.value = false
  emit('close', des + '-' + Math.random())
}

const showEdit = ref(false)
watchEffect(() => {
  showEdit.value = password.value.length >= 6 || originMobile.value !== mobile.value;
})

const submit = withLoading(async () => {
  if (!mobile.value.trim() || mobile.value.trim().length !== 11){
    ElMessage.warning("手机号码必须为11位数的纯数字")
  }else if (password.value.trim() > 1 && password.value.trim() < 6){
    ElMessage.warning("密码必须为6位数以上的英文数字符号")
  }else {
    const obj = {
      "mobile":mobile.value.trim(),
      "password":password.value.trim() ? password.value : null
    }
    const res = await updateUserAccountInfo(obj)
    if (res.code === 2002){
      ElMessage.success(res.msg)
      await loadingUserInfo()
      closeDialog("update")
    }
  }
}, loading)

const exit = () => {
  ElMessage.warning("正在清除授权信息并退出登录")
  setTimeout(()=>{
    sessionStorage.clear()
    window.location.href = '/login'
  }, 1000)
}


</script>

<template>
  <el-dialog v-model="dialog"
             v-if="dialog"
             width="45%"
             style="border-radius: 15px;"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             :lock-scroll="false"
  >
    <template #header>
      <div class="card-header">
        <el-row style="display: flex; align-items: center;">
          <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1">
            <el-button @click="closeDialog('cancel')"
                       style="border: none" :icon="Close" circle/>
          </el-col>
          <el-col :xs="17" :sm="17" :md="17" :lg="11" :xl="17">
            <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;用户中心</h3>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="12" :xl="6" style="text-align: right;">
            <el-button type="primary" round color="#333333" v-if="showEdit" @click="submit">
              确认修改
            </el-button>
            <el-button type="primary" text @click="exit">
              退出登录
            </el-button>
          </el-col>
        </el-row>
      </div>
    </template>
    <el-card shadow="never" style="border-radius: 10px;margin-top: -10px" v-loading="loading">
      <el-form label-position="top">
        <el-row :gutter="15">
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
            <el-card shadow="never" style="border-radius: 5px">
              <el-form-item label="UID">
                <el-text tag="b">{{ uid }}</el-text>
              </el-form-item>
            </el-card>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
            <el-card shadow="never" style="border-radius: 5px">
              <el-form-item label="用户名">
                <el-text tag="b">{{ username }}</el-text>
              </el-form-item>
            </el-card>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
            <el-card shadow="never" style="border-radius: 5px">
              <el-form-item label="真实姓名">
                <el-text tag="b">{{ realName }}</el-text>
              </el-form-item>
            </el-card>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
            <el-card shadow="never" style="border-radius: 5px">
              <el-form-item label="身份">
                <el-text tag="b">{{ authMap[authName] }}</el-text>
              </el-form-item>
            </el-card>
          </el-col>
        </el-row>
        <el-divider/>
        <el-form-item label="手机号码">
          <el-input v-model="mobile"/>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="password" show-word-limit minlength="6" type="password" show-password></el-input>
        </el-form-item>
      </el-form>
    </el-card>
  </el-dialog>
</template>

<style scoped>

</style>