<script setup>
import {ref} from "vue";
import TeacherExamReportStudent from "@/view/teacher-view/report/TeacherExamReportStudent.vue";
import TeacherExamReportAvgScore from "@/view/teacher-view/report/TeacherExamReportAvgScore.vue";

const radioTab = ref('学员评估')
</script>

<template>
  <el-card shadow="never"
           :body-style="{paddingLeft:'0',paddingRight:'0'}"
           style="border-radius: 0;border-left:none;border-top: 0;border-bottom: 0;">
    <el-radio-group v-model="radioTab" fill="#333" style="margin-left: 20px;height: 5vh">
      <el-radio-button label="学员评估" style="border-radius: 15px" />
      <el-radio-button label="测验平均成绩" />
    </el-radio-group>
    <el-divider style="margin-bottom: 0"/>
    <teacher-exam-report-student v-if="radioTab === '学员评估'"/>
    <teacher-exam-report-avg-score v-if="radioTab === '测验平均成绩'"/>
  </el-card>

</template>

<style scoped>
/deep/ .el-radio-button__inner:hover{
  color: #7a859b;
}
</style>