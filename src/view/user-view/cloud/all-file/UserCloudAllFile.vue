<script setup>
import {Search, UploadFilled} from "@element-plus/icons-vue";
import {ref} from "vue";
import TcPagination from "@/components/container/tc-pagination.vue";

const localFile = ref()
const handChange = (file, fileList) => {
  localFile.value = file
  if (fileList.length > 1) {
    fileList.splice(0, 1);
  }
}

// 文件移除时
const handRemove = () => {
  localFile.value = ''
}


const dataList = ref([
  {
    "id": 2,
    "resource_name": "test",
    "up_id": 3,
    "up_datetime": "2023-10-29 15:46:33",
    "dept_id": 1,
    "tag_id": 1,
    "upInfo": {
      "id": 3,
      "realName": "左诗",
      "mobile": "18318924888",
      "auth_id": 3,
      "extra": null,
      "auth": {
        "id": 3,
        "authName": "admin"
      }
    },
    "tagInfo": {
      "id": 1,
      "tag_name": "营销策划",
      "dept_id": 1
    },
    "deptInfo": {
      "id": 1,
      "dept_name": "培训部",
      "head_id": 3,
      "extra": null
    }
  },
  {
    "id": 1,
    "resource_name": "市场营销学习案例",
    "up_id": 3,
    "up_datetime": "2023-10-28 14:40:17",
    "dept_id": 1,
    "tag_id": 1,
    "upInfo": {
      "id": 3,
      "realName": "左诗",
      "mobile": "18318924888",
      "auth_id": 3,
      "extra": null,
      "auth": {
        "id": 3,
        "authName": "admin"
      }
    },
    "tagInfo": {
      "id": 1,
      "tag_name": "营销策划",
      "dept_id": 1
    },
    "deptInfo": {
      "id": 1,
      "dept_name": "培训部",
      "head_id": 3,
      "extra": null
    }
  }
])

const authTagMap = {
  '1':'primary',
  '2':'waring',
  '3':'danger'
}
const authMap = {
  '1':'员工',
  '2':'教师',
  '3':'管理员'
}


</script>

<template>
  <el-card shadow="never"
           style="border-radius: 0; height: 90vh;border-top: none;border-left: none;border-bottom: none;overflow-y: auto">
    <el-row :gutter="15">
      <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
        <el-card style="border-radius: 10px;user-select: none;height: 35vh;background-color: #409EFF;color: white">
          <h3 style="margin-top: 0;margin-bottom: 0">云集&nbsp;Cloud Storage</h3><br/>
          <el-text style="color: #f1f2f3">云集是企业内的云存储服务，其目的是汇集企业内成员分享的各类知识库文档或其他相关资料。请您在上传文件时确保文件内容与部门及分类相同，若部门不存在分类标签，请联系管理员</el-text>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
        <el-card style="border-radius: 10px;user-select: none;height: 35vh" align="center">
          <el-upload
              drag
              :limit="2"
              :auto-upload="false"
              :on-change="handChange"
              :on-remove="handRemove"
          >
            <el-icon class="el-icon--upload">
              <upload-filled/>
            </el-icon>
            <div class="el-upload__text">
              拖动文件至此处 <em>点击上传</em>
            </div>
          </el-upload>
          <el-progress :show-text="false"></el-progress>
        </el-card>
      </el-col>
    </el-row><br/>
    <el-row>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-card style="border-radius: 10px;user-select: none;height: 100vh">
          <el-row :gutter="10">
            <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
              <el-select  placeholder="选择指定部门" />
            </el-col>
            <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
              <el-select placeholder="选择分类标签"/>
            </el-col>
            <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
              <el-input placeholder="搜索资源名称" :prefix-icon="Search"/>
            </el-col>
            <el-col :xs="10" :sm="10" :md="10" :lg="10" :xl="10">
              <tc-pagination :total="100"/>
            </el-col>
          </el-row>
          <el-table
              stripe
              style="margin-top: 15px;height: 85vh;overflow-y: auto;border-radius: 5px"
              border :data="dataList">
            <el-table-column type="index"/>
            <el-table-column prop="resource_name" label="资源名称" min-width="125px" show-overflow-tooltip/>
            <el-table-column label="所属部门">
              <template #default="scope">
                <el-tag :type="'info'">{{ scope.row['deptInfo']['dept_name'] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="分类标签">
              <template #default="scope">
                <el-tag :type="'success'">{{ scope.row['tagInfo']['tag_name'] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="身份权限">
              <template #default="scope">
                <el-tag :type="authTagMap[scope.row['upInfo']['auth_id']]">{{ authMap[scope.row['upInfo']['auth_id']] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="upInfo.realName" label="上传者"/>
            <el-table-column prop="up_datetime" label="上传时间" min-width="125px" show-overflow-tooltip/>
            <el-table-column label="操作" >
              <el-button size="small" round type="primary" >下载</el-button>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<style scoped>
.el-pagination {
  justify-content: center;
}
</style>