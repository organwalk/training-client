import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import RouterIndex from '@/router/index'
import btn from '@/config/button-auto-lose-focus'
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import { createPinia } from 'pinia'

import hljs from 'highlight.js';

VMdEditor.use(githubTheme, {
    Hljs: hljs,
});

VMdPreview.use(githubTheme, {
    Hljs: hljs,
});

const pinia = createPinia()
const app = createApp(App)
app.use(ElementPlus)
app.use(RouterIndex)
app.use(btn)
app.use(VMdEditor)
app.use(VMdPreview)
app.use(pinia)
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