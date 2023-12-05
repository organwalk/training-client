<script setup>
import myFileIcon from "@/assets/my_file.png"
import {onBeforeMount, ref} from "vue";
import {Search} from "@element-plus/icons-vue";
import {withLoading} from "@/utils/functionUtil";
import {getDeptInfo} from "@/api/dept-api";
import {getResourceListByUser} from "@/api/resource-api";

const loading = ref(false)


// 加载部门信息
const deptName = ref('')
const loadingDeptInfo = withLoading(async () => {
  const res = await getDeptInfo(sessionStorage.getItem("dept_id"))
  if (res.code === 2002){
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
  if (res.code === 2002){
    dataListTotal.value = res.total
    dataList.value = res.data
    userName.value = res.data[0]['upInfo']['realName']
    if (dataListTotal.value <= 6){
      showViewMore.value = false
    }
  }
}, loading)

onBeforeMount(async () => {
  await loadingDeptInfo()
  await loadingUserResourceList(0)
})


// 查看更多
const offset = ref(1)
const viewMore = withLoading(async () => {
  offset.value += 1
  const realOffset = ((offset.value) - 1) * 6
  const res = await getResourceListByUser(sessionStorage.getItem("uid"), realOffset)
  if (res.code === 2002){
    dataList.value.push(...res.data)
    if (dataList.value.length === dataListTotal.value){
      showViewMore.value = false
    }
  }
}, loading)



</script>

<template>
  <el-card shadow="never"
           style="border-radius: 0; height: 90vh;border-top: none;border-left: none;border-bottom: none;overflow-y: auto">
    <el-card style="border-radius: 10px;user-select: none;" v-loading="loading">
      <h3 style="margin-top: 0; margin-bottom: 0;">|&nbsp;&nbsp;我的上传</h3>
    </el-card><br/>
    <el-card style="border-radius: 10px;user-select: none;" align="center">
      <el-image :src="myFileIcon" fit="cover" style="border-radius: 50%;height: 20vh"></el-image>
      <div style="margin-top: 10px;margin-bottom: 10px">
        <span style="font-weight: bolder">{{ deptName }}</span>
        <el-divider direction="vertical" />
        <span style="font-weight: bolder">{{ userName }}</span>
        <el-divider direction="vertical" border-style="dashed" />
        <span style="font-weight: bolder">{{ dataListTotal }}</span>
      </div>
    </el-card><br/>
    <el-card style="border-radius: 10px;user-select: none;height: 70vh;" >
      <el-row>
        <el-input placeholder="搜索已上传资源名称" :prefix-icon="Search"/>
      </el-row><br/>
      <el-scrollbar height="50vh" v-loading="loading" always>
        <el-timeline>
          <el-timeline-item
              v-for="(activity, index) in dataList"
              :key="index"
              :timestamp="activity.up_datetime"
          >
            <el-popover
                width="200"
                placement="left"
                trigger="click"
            >
              <div align="center">
                <el-button size="small" type="primary" text>编辑</el-button>
                <el-divider direction="vertical" />
                <el-button size="small" type="primary" text>重传</el-button>
                <el-divider direction="vertical" />
                <el-button size="small" type="danger" text>删除</el-button>
              </div>
              <template #reference>
                <span>{{ activity.resource_name }}</span>
              </template>
            </el-popover>
          </el-timeline-item>
        </el-timeline>
      </el-scrollbar>
      <el-divider content-position="center" @click="viewMore" v-if="showViewMore" style="cursor: pointer">查看更多</el-divider>
      <el-divider content-position="center" v-if="!showViewMore">已加载全部</el-divider>
    </el-card>

  </el-card>
</template>

<style scoped>
/deep/ .el-timeline{
  padding-left: 0;
}
</style>