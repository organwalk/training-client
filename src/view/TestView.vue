<script setup>
import { Client } from '@stomp/stompjs';

const userId = 'unique_user_id'; // 根据实际情况设置用户ID

const client = new Client({
  brokerURL: 'ws://localhost:8187/ws-endpoint',
  onConnect: () => {
    client.subscribe(`/user/${userId}/notifications`, message =>
        console.log(`Received: ${message.body}`)
    );
    client.publish({ destination: `/app/send-notification/${userId}`, body: 'First Message' });
  },
});

client.activate();

</script>

<template>
  <div style="width: 100vw;text-align: center">
    <h3>websocket测试</h3>
    <el-button @click="sendMessage">发送消息</el-button><br/>
    <el-button @click="disconnect">关闭连接</el-button>
  </div>
</template>

<style scoped>

</style>