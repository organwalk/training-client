<script setup>
import TcCardCenterContent from "@/components/card/tc-card-center-content.vue";
import {reactive, ref} from "vue";
import {User} from '@element-plus/icons-vue'
import TcButtonConform from "@/components/button/tc-button-conform.vue";
import axios from "axios";
import {ElMessage} from "element-plus";

const loginInfo = reactive({
  username:'',
  password:''
})
const passwordShow = ref(false)
const next = () => {
  passwordShow.value = true
}
const login = async () => {
  alert(JSON.stringify(loginInfo))
  axios.post('http://localhost:8180/api/user/v1/auth', loginInfo).then(res => {
    if (res.code !== 2002){
      ElMessage.error(res.msg)
    }
    const authInfo = res.data
    sessionStorage.setItem("uid", authInfo.uid)
    sessionStorage.setItem("username", authInfo.username)
    sessionStorage.setItem("access_token", authInfo.access_token)
    sessionStorage.setItem("auth_name", authInfo.auth_name)
    ElMessage.success("登录成功")
    setTimeout(()=>{
      switch (sessionStorage.getItem("auth_name")){
        case "admin":
          window.local.href = "/admin/user"
      }
    })
  })
}


</script>

<template>
  <br/><br/>
  <el-row>
    <el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8" />
    <el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8">
      <tc-card-center-content>
        <el-row>
<!--          登录banner图-->
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <img class="auth-img" src="@/assets/auth.png" alt="404">
          </el-col>
        </el-row>
        <el-row>
<!--          登陆页面标题-->
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <span class="auth-title">Training-Client</span>
          </el-col>
        </el-row><br/>
<!--        登录页面提示文字-->
        <el-row>
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <span>请使用您的企业内部培训软件账号进行登录</span>
          </el-col>
        </el-row><br/>
        <el-row>
<!--          输入手机号或密码-->
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" center>
            <el-input v-model="loginInfo.username"
                      @keyup.enter="next"
                      :prefix-icon="User"
                      v-show="!passwordShow"
                      placeholder="用户名或手机号码"
                      maxlength="15"
                      show-word-limit autofocus size="large"/>
            <el-input v-model="loginInfo.password"
                      @keyup.enter="login"
                      :prefix-icon="User"
                      v-show="passwordShow"
                      placeholder="密码"
                      autofocus size="large"/>
          </el-col>
        </el-row><br/>
        <el-row>
          <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" align="left">
            <el-popover
                placement="bottom"
                :width="200"
                trigger="click"
            >
              <template #reference>
                <el-button text style="color: #2C6AE3">了解详情</el-button>
              </template>
              <span>本客户端账号由管理员分配，如员工需使用此服务，请先联系平台管理员</span>
            </el-popover>
          </el-col>
          <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" align="right">
            <tc-button-conform @click="next" v-if="!passwordShow">下一步</tc-button-conform>
            <tc-button-conform @click="login" v-if="passwordShow">登录</tc-button-conform>
          </el-col>
        </el-row>
      </tc-card-center-content>
    </el-col>
    <el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8" />
  </el-row>
</template>

<style scoped>
.auth-img{
  width: 100%
}
.auth-title{
  font-weight: bolder;
  font-size: 30px;
  font-family: 微软雅黑,system-ui
}
:deep(.el-input){
  --el-input-focus-border:#002fa7;
  --el-input-focus-border-color: #002fa7
}
</style>