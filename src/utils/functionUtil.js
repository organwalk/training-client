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