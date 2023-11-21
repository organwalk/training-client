<script setup>
import Player from 'xgplayer'
import { Events } from 'xgplayer'
import 'xgplayer/dist/index.min.css'
import {ref, watchEffect} from "vue";
import {defineProps, defineEmits} from "vue"
import {objectsIsNull} from "@/utils/dataUtil";

const props = defineProps({
  videoUrl:String,
  pauseTimeList:Array,
  width:Number,
  height:Number,
  isPause:Boolean,
  isPlay:Boolean,
  isExitFullScreen:Boolean,
  seekTime:Number
})
const emit = defineEmits([
    'getCurrentTime',
    'getPlay',
    'getSeekingTime'
])


// 初始化视频对象
const video = ref()
let player
let videoObj = {
  id: 'video',
  width:props.width,
  height:props.height,
  url:props.videoUrl
}
const pauseTimeList = ref([])  // 需要暂停的时间

watchEffect(() => {
  // 当配置信息和视频DOM存在时触发
  if (!objectsIsNull(videoObj) && video.value){
    player = new Player(videoObj)

    // 在指定时间处显示节点信息，如果时间可用
    if (props.pauseTimeList) {
      // 获取需要暂停的时间秒数，并以升序排列
      pauseTimeList.value = props.pauseTimeList.map(obj => (obj.test_time)).sort((a, b) => a - b)
      // 配置视频测试题提示节点
      videoObj.progressDot = props.pauseTimeList.map(obj => ({
        id:obj.id,
        time:obj.test_time,
        text:'视频测试题',
        duration: 2,
        style: {
          backgroundColor: '#ffffff'
        }
      }))
      player = new Player(videoObj)
    }

    player.on('timeupdate', function (event){
      emit('getCurrentTime', parseInt(event.currentTime))
    })

    player.on(Events.PLAY, () => {
      emit('getPlay' , true)
    })

    player.on('seeking', (event) => {
      emit('getSeekingTime', parseInt(event.currentTime))
    })
  }
})

watchEffect(() => {
  if (props.isPause){
    player.pause()
  }
})
watchEffect(() => {
  if (props.isPlay){
    player.play()
  }
})
watchEffect(() => {
  if (props.isExitFullScreen){
    player.exitFullscreen(player.root)
  }
})
watchEffect(() => {
  if (props.seekTime){
    player.seek(props.seekTime.split('-')[0])
  }
})




</script>

<template>
  <div id="video" ref="video"></div>
</template>

<style scoped>

</style>