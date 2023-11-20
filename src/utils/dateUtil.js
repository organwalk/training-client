// 获取当下时间
export function getNowDate(){
    return new Date(new Date().setHours(0, 0, 0, 0))
}

// 校验禁用时间
export function validDateDisabled(validType, ruleDate, checkDate){
    if (validType === 'start'){
        return getNowDate() > checkDate || getNowDate() === checkDate
    }else if (validType === 'end'){
        return ruleDate >= checkDate
    }
}

// 获取yyyy-mm-dd的时间
export function getISO8601(date){
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
}

// 检查是否逾期超时
export function validTimeout(validDate){
    return new Date(validDate) > getNowDate()
}


export function secondsToMinutesSeconds(seconds) {
    const minutes = Math.floor(seconds / 60); // 计算分钟数
    const remainingSeconds = seconds % 60; // 计算剩余的秒数

    const formattedMinutes = String(minutes).padStart(2, '0'); // 格式化分钟数为两位数
    const formattedSeconds = String(remainingSeconds).padStart(2, '0'); // 格式化剩余秒数为两位数

    return `${formattedMinutes}:${formattedSeconds}`;
}