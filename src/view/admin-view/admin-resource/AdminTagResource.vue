<script setup>
import {defineProps, onBeforeMount, ref, watchEffect} from 'vue'
import {editTag, getResourceTagList} from "@/api/resource-api";
import TcContainerFullRow from "@/components/container/tc-container-full-row.vue";
import {ElMessage} from "element-plus";

const props = defineProps({
  deptId: Number,
  dialogDes: String
})
const loading = ref(true)
const empty = ref(false)

// 初始化部门数据
const deptId = ref()
const dialogDes = ref()
watchEffect(async () => {
  deptId.value = props.deptId
  dialogDes.value = props.dialogDes
})
watchEffect(async () => {
  if (deptId.value) {
    await loadingDataList()
  }
})
watchEffect(async () => {
  // 当对话框描述存在时，触发加载结果
  if (dialogDes.value && dialogDes.value.split('-')[0]) {
    await loadingDataList()
  }
})

// 初始化标签列表
const dataList = ref()
const loadingDataList = async () => {
  if (deptId.value) {
    loading.value = true
    const res = await getResourceTagList(deptId.value)
    if (res.code === 2002) {
      empty.value = false
      dataList.value = res.data
    } else {
      dataList.value = []
      empty.value = true
    }
    loading.value = false
  }
}
const newTagName = ref()
const edit = async (id) => {
  const res = await editTag(id, newTagName.value)
  if (res.code === 2002){
    ElMessage.success(res.msg)
  }
}
onBeforeMount(async () => {
  await loadingDataList()
})
</script>

<template>
  <div v-loading="loading" style="height: 80vh;overflow-y: auto">
    <el-row :gutter="10">
      <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" v-for="(item, index) in dataList" :key="index">
        <el-card :shadow="'hover'">
          <tc-container-full-row>
            <el-col :xs="20" :sm="20" :md="20" :lg="24" :xl="20">
              <span>{{ item.tagName }}</span>
            </el-col>
          </tc-container-full-row>
          <br/>
          <el-row>
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="right">
              <el-popover
                  placement="top"
                  title="编辑分类标签"
                  :width="200"
                  trigger="click"
                  hide-after="0"
                  @hide="newTagName = null"
              >
                <el-input v-model="newTagName"
                          placeholder="输入标签名称"
                          size="small"
                          maxlength="10" show-word-limit/><br/><br/>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="center">
                    <el-button size="small" type="primary" @click="edit(item.id)">提交</el-button>
                  </el-col>
                </el-row>
                <template #reference>
                  <el-button size="small" type="primary" >编辑</el-button>
                </template>
              </el-popover>
              <el-button size="small" type="danger">删除</el-button>
            </el-col>
          </el-row>
        </el-card>
        <br/>
      </el-col>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" align="center">
        <el-empty v-if="empty"/>
      </el-col>
    </el-row>

  </div>
</template>

<style scoped>

</style>