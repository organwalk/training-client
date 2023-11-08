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