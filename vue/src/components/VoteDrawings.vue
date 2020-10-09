<template>
  <div>
    <div v-for="(key, content) in game_content" :key="content">
      <h2 v-if="content !== '[object Object]'"> Players were prompted to draw a {{content}}!</h2>
      <p v-if="content !== '[object Object]'"> This is what they did: </p>
      <table>
        <tbody>
          <tr v-for="data in key" :key="data.img">
            <td><img alt="drawing" :src=data.img /></td>
            <td>
              <button :disabled="disabled[content]"
                      v-on:click="vote(content, data.from)" >
                 Vote this!
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <button v-on:click="$emit('on_finish')">Finish!</button>
  </div>
</template>

<script>
export default{
  data: () => ({
    disabled: {}
  }),

  props: ['game_content', 'votes'],

  methods: {
    vote(content, author){
      this.disabled[content] = true
      this.$emit('cast_vote', content, author)
    }
  },

  mounted: function() {
    for (let subject in this.game_content) {
      this.disabled[subject] = false
    }
  }
}
</script>
