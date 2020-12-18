<template>
  <div id="app">
    <GameState />
  </div>
</template>

<script>
import GameState from './components/GameState.vue'

export default {
  name: 'App',
  components: {
    GameState
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
