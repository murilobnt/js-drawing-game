<template>
  <div id="app">
    <SubjectsList />
  </div>
</template>

<script>
import SubjectsList from './components/SubjectsList.vue'

export default {
  name: 'App',
  components: {
    SubjectsList
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
