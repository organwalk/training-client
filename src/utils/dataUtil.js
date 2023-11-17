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
            obj.total_progress = parseInt(obj.total_progress) * 100 || 0;
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