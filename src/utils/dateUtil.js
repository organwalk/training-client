// 获取当下时间
export function getNowDate() {
    return new Date(new Date().setHours(0, 0, 0, 0))
}

// 校验禁用时间
export function validDateDisabled(validType, ruleDate, checkDate) {
    if (validType === 'start') {
        return getNowDate() > checkDate || getNowDate() === checkDate
    } else if (validType === 'end') {
        return ruleDate >= checkDate
    }
}

// 获取yyyy-mm-dd的时间
export function getISO8601(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
}

export function getDateTimeISO8601(inputDate) {
    let year = inputDate.getFullYear();
    let month = ('0' + (inputDate.getMonth() + 1)).slice(-2); // 月份从0开始，需要加1并补零
    let day = ('0' + inputDate.getDate()).slice(-2); // 补零
    let hours = ('0' + inputDate.getHours()).slice(-2); // 补零
    let minutes = ('0' + inputDate.getMinutes()).slice(-2); // 补零
    let seconds = ('0' + inputDate.getSeconds()).slice(-2); // 补零
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 检查是否逾期超时
export function validTimeout(validDate) {
    return new Date(validDate) > getNowDate()
}


export function secondsToMinutesSeconds(seconds) {
    const minutes = Math.floor(seconds / 60); // 计算分钟数
    const remainingSeconds = seconds % 60; // 计算剩余的秒数

    const formattedMinutes = String(minutes).padStart(2, '0'); // 格式化分钟数为两位数
    const formattedSeconds = String(remainingSeconds).padStart(2, '0'); // 格式化剩余秒数为两位数

    return `${formattedMinutes}:${formattedSeconds}`;
}

export function getNowDateTime() {
    return new Date(new Date())
}

export function plusDateTimeAboutHour(currentDate, hour) {
    return new Date(currentDate.setHours(currentDate.getHours() + hour))
}


export function isEarlierThanCurrentTime(end_datetime) {
    // 将 end_datetime 字符串转换为 Date 对象
    const endTime = new Date(end_datetime);
    // 获取当前时间
    const currentTime = new Date();
    // 比较时间
    return endTime < currentTime;
}


export function isLaterThanCurrentTime(start_datetime) {
    // 将 start_datetime 字符串转换为 Date 对象
    const startTime = new Date(start_datetime);
    // 获取当前时间
    const currentTime = new Date();
    // 比较时间
    return startTime > currentTime;
}

export function isMiddleCurrentTime(start_datetime, end_datetime) {
    // 将 start_datetime 字符串转换为 Date 对象
    const startTime = new Date(start_datetime);
    const endTime = new Date(end_datetime);
    // 获取当前时间
    const currentTime = new Date();
    // 比较时间
    return startTime <= currentTime && currentTime < endTime;
}
