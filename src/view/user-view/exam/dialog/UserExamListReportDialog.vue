<script setup>
import {Close} from "@element-plus/icons-vue";
import {ref, defineProps, watchEffect, defineEmits} from "vue";
import {getTestResult} from "@/api/learn-api";
import {withLoading} from "@/utils/functionUtil";

const emit = defineEmits(['close'])
const props = defineProps({
  dialog:Boolean,
  testId:Number
})
const dialog = ref(false)
watchEffect(() => {
  if (props.dialog){
    dialog.value = props.dialog
  }
})


// 加载考试结果
const loading = ref(false)
const score = ref()
const level = ref()
const rank = ref()
watchEffect(withLoading(async () => {
  if (props.testId){
    const res = await getTestResult(props.testId, sessionStorage.getItem("uid"))
    if (res.code === 2002){
      score.value = res.data['composite_score']
      level.value = res.data['level']
      rank.value = res.data['rank']
    }
  }
}, loading))

// 关闭对话框
const closeDialog = (des) => {
  dialog.value = false
  emit('close', des + '-' + Math.random())
}

</script>

<template>
  <el-dialog v-model="dialog"
             v-if="dialog && !loading"
             width="45%"
             style="border-radius: 15px"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"
             :lock-scroll="false"
  >
    <template #header>
      <div class="card-header">
        <el-row style="display: flex; align-items: center;">
          <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1">
            <el-button style="border: none"
                       :icon="Close"
                       @click="closeDialog('cancel')"
                       circle/>
          </el-col>
          <el-col :xs="17" :sm="17" :md="17" :lg="17" :xl="17">
            <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;查看成绩</h3>
          </el-col>
        </el-row>
      </div>
    </template>
    <el-card style="border-radius: 10px;user-select: none" shadow="never" align="center"
             v-loading="loading">
      <el-row justify="center">
        <!--suppress JSValidateTypes -->
        <el-statistic title="综合成绩" :value="score"/>
        <el-divider direction="vertical"/>
        <!--suppress JSValidateTypes -->
        <el-statistic title="评估等级" :value-style="{display:'none'}">
          <template #suffix>
            {{ level }}
          </template>
        </el-statistic>
        <el-divider direction="vertical" border-style="dashed"/>
        <el-statistic title="考核排名" :value="rank" />
      </el-row>
    </el-card><br/>
  </el-dialog>
</template>

<style scoped>

</style>