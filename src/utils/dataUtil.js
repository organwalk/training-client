// 将对象key的值都转化为空字符串
export function clearObjectValues(obj) {
    Object.keys(obj).forEach(function(key) {
        obj[key] = "";
    });
}

// 当对象key的值为空时，返回true
export function objectsIsNull(obj){
    return Object.keys(obj).some(key => !obj[key])
}

// 比较两个数组的内容，相等时返回true
export function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    return arr1.every(item => arr2.includes(item));
}

// 当原数组增加或减少时，返回增加或减少的数组
export function getArrayChanges(originalArray, modifiedArray) {
    const decreasedValues = [];
    const increasedValues = [];
    // 检查减少的值
    for (let i = 0; i < originalArray.length; i++) {
        if (!modifiedArray.includes(originalArray[i])) {
            decreasedValues.push(originalArray[i]);
        }
    }
    // 检查增加的值
    for (let i = 0; i < modifiedArray.length; i++) {
        if (!originalArray.includes(modifiedArray[i])) {
            increasedValues.push(modifiedArray[i]);
        }
    }
    return {
        decreased: decreasedValues,
        increased: increasedValues
    };
}

// 计算文件哈希值
export function calculateHash(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const dataBuffer = event.target.result;
            crypto.subtle.digest('SHA-256', dataBuffer)
                .then(hashBuffer => {
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
                    resolve(hashHex);
                })
                .catch(error => reject(error));
        };
        reader.readAsArrayBuffer(file);
    })
}


// 培训计划选择器列表整理
const planState = {
    "timeout": "逾期超时",
    "end": "已经结束",
    "over": "已经完成",
    "ongoing": "正在进行"
};
export function selectPlanListSwitch(dataList){
    // 根据 training_state 分类数据
    const categorizedData = {};
    dataList.forEach(item => {
        const state = planState[item.training_state];
        if (categorizedData[state]) {
            categorizedData[state].push({
                value: `${item.id}`,
                label: item.training_title
            });
        } else {
            categorizedData[state] = [{
                value: `${item.id}`,
                label: item.training_title
            }];
        }
    });
    return Object.keys(categorizedData).map(state => {
        return {
            label: state,
            options: categorizedData[state]
        };
    });
}


// 处理进度
export function processProgress(objList) {
    objList.forEach(obj => {
        // 检查 total_progress 是否为 undefined，如果是则设为 0
        if (obj.total_progress === undefined) {
            obj.total_progress = 0;
        } else {
            // 将其他类型的值转换为整数并乘以 100
            obj.total_progress = parseInt(String(obj.total_progress * 100)) || 0;
        }
    });
    return objList;
}

// 深度检查两个对象的值是否相等
export function deepCompareObject(obj1, obj2) {
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return obj1 === obj2;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (!deepCompareObject(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}


// 为数组加上PID对象
export function setObjectListPID(objList) {
    return objList.map((obj, index) => {
        obj.p_id = `P${index + 1}`;
        return obj;
    });
}

// 生成随机哈希
export async function generateRandomHash() {
    const buffer = new Uint8Array(16);
    window.crypto.getRandomValues(buffer);
    const hashArray = Array.from(buffer)
        .map(b => b.toString(16).padStart(2, '0'));
    return hashArray.join('');
}

// 自动生成递增选项
export function getOptionLabel(array) {
    // 获取最后一个选项的字母
    const lastOption = array[array.length - 1];
    let newLabel = '选项'
    if (lastOption) {
        // 获取最后一个选项的字母，并增加到下一个字母
        const lastLabel = lastOption.label.trim();
        const nextCharCode = lastLabel.charCodeAt(2) + 1;
        newLabel += String.fromCharCode(nextCharCode);
    } else {
        newLabel += 'A';
    }
    return newLabel
}

// 由选项数组生成选项对象
export function getOptionObj(array){
    return array.reduce((result, item) => {
        // 获取 label 属性的第四个字符作为键，值为空字符串
        let key = item.label.charAt(2);
        result[key] = item.content;
        return result;
    }, {})
}

export function convertToObjectArray(obj) {
    return Object.entries(obj).map(([option, content]) => ({ option, content }));
}

export function isJsonString(str) {
    if (typeof str == 'string') {
        try {
            let obj=JSON.parse(str);
            return !!(typeof obj == 'object' && obj);

        } catch(e) {
            return false;
        }
    }
}

export function isValidJSON(jsonString) {
    try {
        JSON.parse(jsonString);
        return true;
    } catch (error) {
        return false;
    }
}