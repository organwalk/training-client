<script setup>
import {useRouter} from "vue-router";
import {withLoading} from "@/utils/functionUtil";
import {onBeforeMount, ref} from "vue";
import {getLessonDetail} from "@/api/plan-api";
import {getChapterListByLesson} from "@/api/learn-api";
import {setObjectListPID} from "@/utils/dataUtil";
import {CircleCheck} from "@element-plus/icons-vue";
import {getResourceLessonRid, getResourceLessonType} from "@/api/resource-api";

const loading = ref(false)
const router = useRouter()
const lessonId = ref(router.currentRoute.value.query.lessonId)


// 加载课程细节
const lessonObj = ref()
const loadingLessonDetail = withLoading(async () => {
  const res = await getLessonDetail(lessonId.value)
  if (res.code === 2002){
    lessonObj.value = res.data
  }
}, loading)


// 加载章节列表
const overChapter = ref()
const chapterList = ref()
const loadingChapterList = withLoading(async () => {
  const res = await getChapterListByLesson(lessonId.value, sessionStorage.getItem("uid"))
  if (res.code === 2002){
    overChapter.value = res.data['overChapterList']
    chapterList.value = setObjectListPID(res.data['chapterResultList'])
  }
}, loading)

// 加载章节对应的资源列表
const loadingResourceList = withLoading(async () => {
  const res = await getResourceLessonRid(Number(lessonId.value))
  if (res.code === 2002){
    chapterList.value.forEach(item2 => {
      const foundItem = res.data.find(item1 => item1['chapterId'] === item2.id);
      if (foundItem) {
        item2.resourceId = foundItem.id;
      }
    })
  }
}, loading)


// 加载教材
const textBookLoading = ref(false)
const pushTextBook = async (chapterId, resourceId) => {
  textBookLoading.value = true
  const res = await getResourceLessonType(resourceId)
  if (res.code === 2002) {
    await router.push({
      path: '/user/textbook',
      query: {
        resourceType: res.data.split('.')[1],
        resourceId: resourceId,
        lessonId: lessonId.value,
        chapterId:chapterId
      }
    })
  }
  textBookLoading.value = false
}

// 根据课程ID加载数据
onBeforeMount(async () => {
  if (lessonId.value){
    await loadingLessonDetail()
    await loadingChapterList()
    await loadingResourceList()
  }
})
</script>

<template>
  <el-progress :percentage="50" color="#333" :duration="1" :indeterminate="true" :show-text="false" v-if="loading"/>
  <el-row style="height: 90vh" v-if="!loading">
    <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4" />
    <el-col :xs="16" :sm="16" :md="16" :lg="16" :xl="16">
      <el-card shadow="never" style="border: none">
        <el-card shadow="never" style="border-radius: 15px" v-if="!loading">
          <h3 style="margin-top: 0;margin-bottom: 0">{{ lessonObj.lesson_name }}</h3>
          <span style="font-weight: lighter;color: #909399;font-size: 0.9rem">{{ lessonObj.lesson_des }}</span><br/><br/>
          <el-text >上一次学习至:&nbsp;&nbsp;<el-text type="primary">{{ overChapter ? overChapter['chapterName'] : '暂无' }}</el-text></el-text>
        </el-card><el-divider content-position="left">章节列表</el-divider>
        <el-card shadow="never" style="border: none;user-select: none;cursor: pointer;" v-loading="textBookLoading" :body-style="{paddingTop:0}">
          <el-row v-for="(item, index) in chapterList" :key="index" style="display: flex;align-items: center">
            <el-card shadow="hover" style="width: 100%;margin-top: 15px;border-radius: 10px" @click="pushTextBook(item.id, item.resourceId)">
              <el-row :style="{color: item.over ? '#909399' : '#333'}">
                <el-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2" >
                  <h4 style="margin-top: 0;margin-bottom: 0"> {{ item['p_id'] }} </h4>
                </el-col>
                <el-col :xs="20" :sm="20" :md="20" :lg="20" :xl="20">
                  <h4 type="primary" style="margin-top: 0;margin-bottom: 0">{{ item['chapterName'] }}</h4>
                </el-col>
                <el-col :xs="2" :sm="2" :md="2" :lg="2" :xl="2" align="center">
                  <el-icon size="large" v-if="item.over"><CircleCheck /></el-icon>
                </el-col>
              </el-row>
            </el-card>
          </el-row>
        </el-card>
      </el-card>
    </el-col>
    <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4" />
  </el-row>
</template>

<style scoped>

</style>