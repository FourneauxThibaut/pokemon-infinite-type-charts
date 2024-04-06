import { createApp } from 'vue'
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import hljs from 'highlight.js';
import CodeEditor from 'simple-code-editor';
import './style.css'

// init app
const app = createApp(App);

// vue-router 
app.use(router);

// pinia && pinia-plugin-persistedstate
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

// https://oh-vue-icons.js.org/docs
import { OhVueIcon, addIcons } from "oh-vue-icons";

import * as LineAwesomeIcons from "oh-vue-icons/icons/la";
console.log(LineAwesomeIcons);
const La = Object.values({ ...LineAwesomeIcons });
addIcons(...La);

import * as FaIcons from "oh-vue-icons/icons/fa";
console.log(FaIcons);
const Fa = Object.values({ ...FaIcons });
addIcons(...Fa);

// components
app.component("v-icon", OhVueIcon);
app.component('code-editor', CodeEditor);

// mount
app.mount("#app");