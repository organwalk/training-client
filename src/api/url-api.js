// 视频地址前缀

export const videoURL = (rid) => {
    return "http://localhost:8180/api/resource/v1/lesson/load/" + rid + '/' + String(Math.random()).split('.')[1]
}