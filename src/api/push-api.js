import http from "@/api/http";

// 获取所有的通知列表
export function getAllNotificationList(uid, pageSize, offset){
    return http.get('/push/v1/notification/' + uid + '/' + pageSize + '/' + offset)
}

// 将通知设为已读
export function isReadNotification(uid, nid){
    return http.put('/push/v1/notification/' + uid + '/' + nid)
}