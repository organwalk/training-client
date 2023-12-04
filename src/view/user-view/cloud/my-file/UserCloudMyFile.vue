<script setup>
import myFileIcon from "@/assets/my_file.png"
import {ref} from "vue";
import {Search} from "@element-plus/icons-vue";

const dataList = ref([
  {
    "id": 1,
    "resource_name": "营销学习",
    "up_id": 6,
    "up_datetime": "2023-10-22 13:40:19",
    "upInfo": {
      "id": 6,
      "realName": "李雨村",
      "mobile": "18318924833",
      "auth_id": 1,
      "extra": null,
      "auth": {
        "id": 1,
        "authName": "none"
      }
    }
  }
])

</script>

<template>
  <el-card shadow="never"
           style="border-radius: 0; height: 90vh;border-top: none;border-left: none;border-bottom: none;overflow-y: auto">
    <el-card style="border-radius: 10px;user-select: none;">
      <h3 style="margin-top: 0; margin-bottom: 0;">|&nbsp;&nbsp;我的上传</h3>
    </el-card><br/>
    <el-card style="border-radius: 10px;user-select: none;" align="center">
      <el-image :src="myFileIcon" fit="cover" style="border-radius: 50%;height: 20vh"></el-image>
      <div style="margin-top: 10px;margin-bottom: 10px">
        <span style="font-weight: bolder">运维部</span>
        <el-divider direction="vertical" />
        <span style="font-weight: bolder">qizeke123</span>
        <el-divider direction="vertical" border-style="dashed" />
        <span style="font-weight: bolder">123</span>
      </div>
    </el-card><br/>
    <el-card style="border-radius: 10px;user-select: none;height: 70vh" >
      <el-row>
        <el-input placeholder="搜索已上传资源名称" :prefix-icon="Search"/>
      </el-row>

      <el-table :data="dataList">
        <el-table-column prop="resource_name" show-overflow-tooltip/>
        <el-table-column align="right">
          <el-popover
              width="200"
              placement="bottom"
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
              <el-button size="small" round>更多操作</el-button>
            </template>
          </el-popover>
        </el-table-column>


      </el-table>
    </el-card>

  </el-card>
</template>

<style scoped>

</style>