<template>
  <div>
    <h2>Results!</h2>
    <h3>Podium</h3>
      <p v-for='(item, key) in podium' :key="key" :style="font_size[key]">
        In the {{prefix[key]}} place: {{item[0]}}, with {{item[1]}} vote(s)!
      </p>
    <button v-on:click="$emit('reset_client')">Main Menu</button>
  </div>
</template>

<script>
export default {
  data: () => ({
    podium : {},
    font_size : ['200%', '150%', '125%'],
    prefix : ['1st', '2nd', '3rd']
  }),
  props: ['results'],
  mounted: function() {
    let local_res = this.results
    let items = Object.keys(local_res).map(function(key) {
      return [key, local_res[key]];
    });

    items.sort(function(first, second) {
      return second[1] - first[1];
    });

    this.podium = items.slice(0, 3)
  }
}
</script>
