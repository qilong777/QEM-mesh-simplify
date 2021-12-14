<template>
  <div id="app"></div>
</template>

<script lang="ts">
import { log } from 'three';
import { Component, Vue } from 'vue-property-decorator';
import DemoService from './service/demo.service';

@Component({
  name: 'App',
})
export default class App extends Vue {
  mounted(): void {
    const instance = new DemoService();
    instance.init();
  }
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}
html,
body,
#app {
  height: 100%;
  width: 100%;
}
</style>
