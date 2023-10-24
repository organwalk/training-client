import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import RouterIndex from '@/router/index'
import btn from '@/config/button-auto-lose-focus'

const app = createApp(App)
app.use(ElementPlus)
app.use(RouterIndex)
app.use(btn)
app.mount('#app')

/**
 * ----- 此处无需维护 -----
 * 用以解决ElementPlus循环渲染导致的BUG提示
 * by organwalk 2023-10-24
 */
const debounce = (fn, delay) => {
    let timer = null;
    return function () {
        let context = this;
        let args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    }
}
const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver{
    constructor(callback) {
        callback = debounce(callback, 16);
        super(callback);
    }
}