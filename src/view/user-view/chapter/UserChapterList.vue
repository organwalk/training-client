<script setup>
import {useRouter} from "vue-router";
import {withLoading} from "@/utils/functionUtil";
import {ref, watchEffect} from "vue";
import {getLessonDetail} from "@/api/plan-api";

const loading = ref(false)
const router = useRouter()
const lessonId = ref(router.currentRoute.value.query.lessonId)
const lessonObj = ref()
const loadingLessonDetail = withLoading(async () => {
  const res = await getLessonDetail(lessonId.value)
  if (res.code === 2002){
    lessonObj.value = res.data
  }
}, loading)

watchEffect(async () => {
  if (lessonId.value){
    await loadingLessonDetail()
  }
})
</script>

<template>
  <el-row style="height: 90vh" v-loading="loading">
    <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4" />
    <el-col :xs="16" :sm="16" :md="16" :lg="16" :xl="16">
      <el-card shadow="never" style="border: none">
        <el-card shadow="never" style="border-radius: 15px">
          <h3 style="margin-top: 0;margin-bottom: 0">{{ lessonObj.lesson_name }}</h3>
          <span style="font-weight: lighter;color: #909399;font-size: 0.9rem">{{ lessonObj.lesson_des }}</span>
        </el-card><br/>
        <el-card shadow="never" style="border-radius: 15px">

        </el-card>
      </el-card>
    </el-col>
    <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4" />
  </el-row>
</template>

<style scoped>

</style>