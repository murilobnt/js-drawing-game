<template>
  <div>
    <h2>Draw a {{subject}}!</h2>
    <vue-drawing ref="vue_drawing_board"></vue-drawing>
    <button v-on:click="next">
      Next!
    </button>
  </div>
</template>

<script>
export default {
  props: ['subject'],
  methods: {
    next() {
      const img = this.$refs.vue_drawing_board.drawing.project.view.element.toDataURL()
      this.$refs.vue_drawing_board.cleanCanvas()
      this.$emit("on_next", img)
    }
  }
}
</script>
