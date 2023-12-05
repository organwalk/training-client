import {customRef} from "vue";

export function withLoading(fn, loading) {
    return async function() {
        try {
            loading.value = true;
            await fn.apply(this, arguments);
        } finally {
            loading.value = false;
        }
    };
}

export function withButtonLoading(fn, buttonLoading) {
    return async function() {
        try {
            buttonLoading.value = true;
            await fn.apply(this, arguments);
        } finally {
            buttonLoading.value = false;
        }
    };
}


export function withPreLoading(fn, preLoading) {
    return async function() {
        try {
            preLoading.value = true;
            await fn.apply(this, arguments);
        } finally {
            preLoading.value = false;
        }
    };
}

export function withBoolean(fn, boolean){
    return async function() {
        try {
            boolean.value = true;
            await fn.apply(this, arguments);
        } finally {
            boolean.value = false;
        }
    };
}


