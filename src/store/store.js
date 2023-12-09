import {defineStore} from "pinia";
import {ref} from "vue";

export const useDeptStore = defineStore('counter', () => {
    const deptId = ref()
    function setDeptId(realDeptId){
        deptId.value = realDeptId
    }
    return { deptId, setDeptId}
})

export const useNotificationStore = defineStore('notification', () => {
    const showNotification = ref()
    function isTrue(){
        showNotification.value = Math.random()
    }
    return {showNotification, isTrue}
})

export const usePushNotificationStore = defineStore('push', () =>{
    const pushBody = ref()
    function setPushBody(obj){
        pushBody.value = obj
    }
    return {pushBody, setPushBody}
})