<script setup>
import {ref, defineProps, defineEmits, watchEffect, reactive} from "vue";
import TcButtonConform from "@/components/button/tc-button-conform.vue";
import {addResourceTag} from "@/api/resource-api";
import {ElMessage} from "element-plus";
import TcDeptSelect from "@/components/select/tc-dept-select.vue";

const props = defineProps({
  title: String,
  showTagResourceDialog: Boolean
})
const emit = defineEmits(['closeTagResource'])
const loading = ref(false)
const showTagResourceDialog = ref()
const closeTagResource = (des) => {
  showTagResourceDialog.value = false
  emit('closeTagResource', {
    state: false,
    des: des + '-' + Math.random()
  })
}
watchEffect(() => {
  showTagResourceDialog.value = props.showTagResourceDialog
})

// 表单数据
const tagObj = reactive({
  dept_id: '',
  tag_name: ''
})
// 获取部门ID
const getDeptId = (deptId) => {
  if (deptId){
    tagObj.dept_id = deptId
  }else {
    closeTagResource(null)
  }
}
// 提交
const checkFormObjFull = (obj) => {
  return Object.keys(obj).some(key => !obj[key])
}
const submit = async () => {
  loading.value = true
  const res = await addResourceTag(tagObj)
  if (res.code === 2002){
    ElMessage.success(res.msg)
    closeTagResource("add")
  }
  loading.value = false
}

</script>

<template>
  <el-dialog v-model="showTagResourceDialog"
             :title="props.title"
             width="30%"
             style="margin-top: 20px"
             destroy-on-close
             :show-close="false"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :before-close="closeTagResource">
    <el-form :model="tagObj" label-width="100px" v-loading="loading">
      <el-form-item label="选择指定部门">
        <tc-dept-select
            @get-dept-id-state="(state) => loading = state"
            @get-dept-id="getDeptId"/>
      </el-form-item>
      <el-form-item label="分类标签名称">
        <el-input v-model="tagObj.tag_name"
                  placeholder="请输入分类标签名称，如：市场营销"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeTagResource" :disabled="loading">取消</el-button>
        <tc-button-conform @click="submit()"
                           :disabled="loading || checkFormObjFull(tagObj)">提交</tc-button-conform>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>