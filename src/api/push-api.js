import http from "@/api/http";
import {ElMessage, ElNotification} from "element-plus";
import {useNotificationStore, usePushNotificationStore} from "@/store/store";
import {computed, watchEffect} from "vue";
import {pushMessageRegex} from "@/config/pushContentConfig";

// 获取所有的通知列表
export function getAllNotificationList(uid, pageSize, offset){
    return http.get('/push/v1/notification/' + uid + '/' + pageSize + '/' + offset)
}

// 将通知设为已读
export function isReadNotification(uid, nid){
    return http.put('/push/v1/notification/' + uid + '/' + nid)
}

// 获取不同类别的通知列表
export function getOtherTypeNotificationList(uid, sourceId, offset){
    return http.get('/push/v1/notification/type/' + uid + '/' + sourceId + '/6/' + offset)
}

function getPushServer(){
    return new WebSocket('ws://localhost:8187/push/' + sessionStorage.getItem("uid")
        + '/' + sessionStorage.getItem("username"));
}

const notificationStore = useNotificationStore()
const pushStore = usePushNotificationStore()
const pushBody = computed(() => pushStore.pushBody)
export function getPushClient(){
    const client = getPushServer()
    client.onopen = () => {
        console.log("websocket connect success:" + new Date());
    };
    client.onmessage = (event) => {
        notificationStore.isTrue()
        let message = event.data
        if (pushMessageRegex.reply.test(event.data)){
            message = JSON.parse(event.data).text
        }else if (pushMessageRegex.test.test(event.data)){
            message = JSON.parse(event.data).text
        }
        ElNotification({
            title: '通知提醒',
            message: message,
            type: 'success',
            duration: 0
        })
        if (event.data === '您被移出培训计划' || event.data === '您被纳入了一个培训计划'){
            setTimeout(() => {
                sessionStorage.removeItem("dept_id")
                location.reload()
            }, 1000)
        }
    };
    client.onerror = () => {
        ElMessage.warning("丢失与推送服务的连接，可能影响您接收通知的实时性")
    };
    client.onclose = () => {
        console.log(new Date())
    };

    watchEffect(() => {
        if (typeof pushBody.value === 'object' && pushBody.value){
            pushNotification(pushBody.value['sourceType'], pushBody.value['content'], pushBody.value['quoteId'], pushBody.value['receiverIdList'], client)
        }
    })


}

export function pushNotification(sourceType, content, quoteId, receiverIdList, client){
    const typeMap = {
        "admin":"admin",
        "teacher":"teacher",
        "none":"user"
    }
    let notificationBody = {
        access_token: sessionStorage.getItem("access_token"),
        notification_type:typeMap[sessionStorage.getItem("auth_name")],
        notification_content:content,
        notification_source_type:sourceType,
        notification_quote_id:quoteId,
        notification_receiver_list:receiverIdList
    }
    client.send(JSON.stringify(notificationBody));
}