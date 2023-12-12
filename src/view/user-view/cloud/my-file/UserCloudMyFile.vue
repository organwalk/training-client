<script setup>
import myFileIcon from "@/assets/my_file.png"
import {onBeforeMount, ref} from "vue";
import {Search} from "@element-plus/icons-vue";
import {withLoading} from "@/utils/functionUtil";
import {getDeptInfo} from "@/api/dept-api";
import {deleteNormalResource, getAllResourceListByUser, getResourceListByUser} from "@/api/resource-api";
import UserCloudMyFIleEditDialog from "@/view/user-view/cloud/my-file/dialog/UserCloudMyFIleEditDialog.vue";
import {ElMessage} from "element-plus";

const loading = ref(false)


// 加载部门信息
const deptName = ref('')
const loadingDeptInfo = withLoading(async () => {
  const res = await getDeptInfo(sessionStorage.getItem("dept_id"))
  if (res.code === 2002) {
    deptName.value = res.data.deptName
  }
}, loading)


// 加载用户上传的资源列表
const dataListTotal = ref(0)
const dataList = ref([])
const userName = ref('')
const showViewMore = ref(true)
const loadingUserResourceList = withLoading(async (offset) => {
  const res = await getResourceListByUser(sessionStorage.getItem("uid"), offset)
  if (res.code === 2002) {
    dataListTotal.value = res.total
    dataList.value = res.data
    copyOriginDataList(dataList.value)
    if (dataListTotal.value <= 6) {
      showViewMore.value = false
    }
  }
  userName.value = sessionStorage.getItem("username")
}, loading)

// 拷贝一份原始数据
const originDataList = ref([])
const copyOriginDataList = (list) => {
  originDataList.value = list
}

onBeforeMount(async () => {
  await loadingDeptInfo()
  await loadingUserResourceList(0)
})


// 查看更多
const resultLoading = ref(false)
const offset = ref(1)
const viewMore = async () => {
  resultLoading.value = true
  offset.value += 1
  const realOffset = ((offset.value) - 1) * 6
  const res = await getResourceListByUser(sessionStorage.getItem("uid"), realOffset)
  if (res.code === 2002) {
    dataList.value.push(...res.data)
    copyOriginDataList(dataList.value)
    if (dataList.value.length === dataListTotal.value) {
      showViewMore.value = false
    }
  }
  resultLoading.value = false
}


// 搜索
const keyword = ref('')
const timer = ref(null)
const search = async (val) => {
  clearTimeout(timer.value)
  timer.value = setTimeout(async () => {
    resultLoading.value = true
    if (val.trim().length === 0){
      dataList.value = originDataList.value
      showViewMore.value = true
    }else {
      let waitingSearchResult = dataListTotal.value === dataList.value.length
          ? dataListTotal.value
          : (await getAllResourceListByUser(sessionStorage.getItem("uid"))).data;
      dataList.value = waitingSearchResult.filter(item => {
        return item['resource_name'].toLowerCase().includes(val.toLowerCase())
      })
      showViewMore.value = false
    }
    resultLoading.value = false
  }, 1000)
}


const nowClickResourceId = ref()
// 编辑
const editDialog = ref(false)
const closeEdit = async (des) => {
  editDialog.value = false
  if (des.split('-')[0] !== 'cancel') {
    await loadingUserResourceList(0)
  }
}
// 删除
const deleteResource = async (rId) => {
  const res = await deleteNormalResource(rId, sessionStorage.getItem("uid"))
  if (res.code === 2002){
    ElMessage.success(res.msg)
    location.reload()
  }
}


</script>

<template>
  <el-card shadow="never"
           style="border-radius: 0; height: 90vh;border-top: none;border-left: none;border-bottom: none;overflow-y: auto" v-loading="loading">
    <el-card style="border-radius: 10px;user-select: none;" >
      <h3 style="margin-top: 0; margin-bottom: 0;">|&nbsp;&nbsp;我的上传</h3>
    </el-card>
    <br/>
    <el-card style="border-radius: 10px;user-select: none;" align="center">
      <el-image :src="myFileIcon" fit="cover" style="border-radius: 50%;height: 20vh"></el-image>
      <div style="margin-top: 10px;margin-bottom: 10px">
        <el-row justify="center">
          <el-statistic title="培训部门" :value-style="{display:'none'}">
            <template #suffix>
              <span>{{ deptName }}</span>
            </template>
          </el-statistic>
          <el-divider direction="vertical"/>
          <el-statistic title="用户名" :value-style="{display:'none'}">
            <template #suffix>
              <span>{{ userName }}</span>
            </template>
          </el-statistic>
          <el-divider direction="vertical" border-style="dashed"/>
          <el-statistic title="上传量" :value="dataListTotal" />
        </el-row>
      </div>
    </el-card>
    <br/>
    <el-card style="border-radius: 10px;user-select: none;height: 70vh;">
      <el-row>
        <el-input placeholder="搜索已上传资源名称"
                  :prefix-icon="Search"
                  v-model="keyword"
                  @input="search"/>
      </el-row>
      <br/>
      <el-scrollbar height="50vh" v-loading="resultLoading" always>
        <el-timeline>
          <el-timeline-item
              v-for="(activity, index) in dataList"
              :key="index"
              :timestamp="activity.up_datetime"
          >
            <el-popover
                width="200" placement="left" trigger="click" hide-after="0"
            >
              <div align="center">
                <el-button size="small" type="primary"
                           @click="() => {
                             editDialog = true
                             nowClickResourceId = activity['id']
                           }"
                           text>重新上传</el-button>
                <el-divider direction="vertical"/>
                <el-button size="small" type="danger"
                           @click="deleteResource(activity.id)"
                           text>删除</el-button>
              </div>
              <template #reference>
                <span style="cursor: pointer">{{ activity.resource_name }}</span>
              </template>
            </el-popover>
          </el-timeline-item>
        </el-timeline>
      </el-scrollbar>
      <el-divider content-position="center" @click="viewMore" v-if="showViewMore && dataList.length !== 0" style="cursor: pointer">查看更多
      </el-divider>
      <el-divider content-position="center" v-if="!showViewMore && dataList.length !== 0">已加载全部</el-divider>
    </el-card>
  </el-card>

<!--  对话框区-->
  <UserCloudMyFIleEditDialog :dialog="editDialog" :rid="nowClickResourceId"
                             @close="closeEdit"/>
</template>

<!--suppress CssUnusedSymbol -->
<style scoped>
/deep/ .el-timeline {
  padding-left: 0;
}
/deep/ .el-statistic__content{
  font-size: 15px;
}
</style>