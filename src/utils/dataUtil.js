export function clearObjectValues(obj) {
    Object.keys(obj).forEach(function(key) {
        obj[key] = "";
    });
}

export function objectsIsNull(obj){
    return Object.keys(obj).some(key => !obj[key])
}