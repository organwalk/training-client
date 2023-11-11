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