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