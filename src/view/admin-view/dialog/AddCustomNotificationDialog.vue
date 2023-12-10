<script setup>
import {ref, defineProps, defineEmits, watchEffect} from "vue";
import {Close} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";
import {usePushNotificationStore} from "@/store/store";
import {getAccountList} from "@/api/user-api";

const pushStore = usePushNotificationStore()
const props = defineProps({
  dialog: Boolean,
  planList: Array
})
const emit = defineEmits(['close'])
const dialog = ref(false)
watchEffect(() => {
  if (props.dialog) {
    dialog.value = props.dialog
  }
})
const closeDialog = (des) => {
  peopleId.value = []
  customContent.value = ''
  dialog.value = false
  emit('close', des + '-' + Math.random())
}

const planList = ref([
  {
    label:'员工',
    value:1,
  },
  {
    label:'教师',
    value:2,
  },
  {
    label:'管理员',
    value:3,
  }
])
const planId = ref()

watchEffect(async () => {
  if (planId.value) {
    await loadingPeople(planId.value)
  }
})

const peopleList = ref([])
const loadingPeople = async (id) => {
  const res = await getAccountList(id)
  if (res.code === 2002) {
    peopleList.value = res.data.map(item => ({
      label: item.realName,
      value: item.id
    }))
  }
}
const peopleId = ref()

const customContent = ref('')
const pushCustom = async () => {
  if (peopleId.value.length === 0){
    ElMessage.warning("必须选择一位通知对象")
  }else if (!customContent.value.trim()){
    ElMessage.warning("必须填写通知内容")
  }else {
    await noticeMessage()
    ElMessage.success("已推送通知")
    closeDialog("push")
  }
}
const noticeMessage = async () => {
  let obj = {
    'sourceType': 'message',
    'content': customContent.value,
    'quoteId': null,
    'receiverIdList': peopleId.value
  }
  await pushStore.setPushBody(obj)
}

</script>

<template>
  <el-dialog v-model="dialog"
             v-if="dialog"
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
            <el-button @click="closeDialog('cancel')"
                       style="border: none" :icon="Close" circle/>
          </el-col>
          <el-col :xs="17" :sm="17" :md="17" :lg="17" :xl="17">
            <h3 style="margin-top: 0;margin-bottom: 0">&nbsp;&nbsp;&nbsp;推送自定义通知</h3>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" style="text-align: right;">
            <el-button @click="pushCustom" type="primary" round color="#333333">
              确认推送
            </el-button>
          </el-col>
        </el-row>
      </div>
    </template>
    <el-card shadow="never" style="border-radius: 10px;margin-top: -10px">
      <el-form label-position="top">
        <el-form-item label="选择人员类别">
          <el-select v-model="planId" placeholder="请选择人员类别" style="width: 100%" filterable>
            <el-option
                v-for="item in planList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择通知人员">
          <el-select style="width: 100%" placeholder="请选择相关人员"
                     v-model="peopleId" :disabled="!planId" :loading="peopleList.length === 0"
                     filterable multiple>
            <el-option
                v-for="item in peopleList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="自定义通知">
          <el-input v-model="customContent" placeholder="填写通知内容" type="textarea" maxlength="50" show-word-limit rows="3"/>
        </el-form-item>
      </el-form>
    </el-card>
  </el-dialog>
</template>

<style scoped>

</style>