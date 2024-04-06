<script setup>
import { ref } from "vue";

let script = ref(
`   new Vue({
        render: h => h(App)
    }).$mount('#app')`
);
</script>

<template>
    <div class="home-view">
        <v-icon class="icon" name="fa-door-open" />
        <v-icon class="icon" name="la-arrow-alt-circle-right" />
        <h1>Home</h1>
    </div>
    <code-editor v-model="script" :read-only="true" :line-nums="true" :languages="[['js']]" :tab-spaces="4" width="80%" theme="github-dark-dimmed" style="margin:  0 auto;"/>
</template>

<style lang="scss">
.icon {
    height: 2.5rem;
    width: 2.5rem;
    color: white;
}
</style>