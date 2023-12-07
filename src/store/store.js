import {defineStore} from "pinia";
import {ref} from "vue";

export const useDeptStore = defineStore('counter', () => {
    const deptId = ref()
    function setDeptId(realDeptId){
        deptId.value = realDeptId
    }
    return { deptId, setDeptId}
})