<script setup>
import Player from 'xgplayer'
import 'xgplayer/dist/index.min.css'
import {onMounted} from "vue";
import {defineProps, defineEmits} from "vue"

const props = defineProps({
  videoUrl:String,
  pauseTimeList:Array,
})

const emit = defineEmits(['getCurrentTime'])

let play
// 当组件挂载时，创建一个video实例
onMounted(() => {
  play = new Player({
    id: 'video',
    width:500,
    height:300,
    url: props.videoUrl
  })
  // 监听时间变动
  play.on('timeupdate', function (event){
    // 记录播放时间
    emit('getCurrentTime', parseInt(event.currentTime))
  })
})


</script>

<template>
  <div id="video"></div>
</template>

<style scoped>

</style>