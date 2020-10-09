<style>

  .left-element {
    display: inline-block;
    float: left;
  }

  .right-element {
    display: inline-block;
    float: left;
  }
</style>

<div>
  <h2>Draw a {subject}!</h2>
  <div>
    <div class="left-element">
      <canvas id="cfd"></canvas>
    </div>
    <div class="right-element">
      <div>
        <button on:click={() => (cfd.undo())}> undo </button>
        <button on:click={() => (cfd.redo())}> redo </button>
        <button on:click={() => (cfd.clear())}>clear</button>
      </div>
      <div>
        <button style="border: 2px solid #f44336" on:click={() => (cfd.setDrawingColor([255, 0, 0]))}>Red</button>
        <button style="border: 2px solid #4CAF50" on:click={() => (cfd.setDrawingColor([0, 255, 0]))}>Green</button>
        <button style="border: 2px solid #008CBA" on:click={() => (cfd.setDrawingColor([0, 0, 255]))}>Blue</button>
        <button style="border: 2px solid #555555" on:click={() => (cfd.setDrawingColor([0, 0, 0]))}>Black</button>
      </div>
    </div>
  </div>
  <div class="left-element">
    <button on:click={() => (dispatch('next', cfd.save()))}> Next! </button>
  </div>
</div>

<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import CanvasFreeDrawing from 'canvas-free-drawing'

  export let subject
  let cfd = null
  const dispatch = createEventDispatcher()

  onMount(() => (setup()))

  function setup(){
    cfd = new CanvasFreeDrawing.default({
      elementId: 'cfd',
      width: 500,
      height: 500,
    });

    // set properties
    cfd.setLineWidth(10); // in px
    cfd.setStrokeColor([0, 0, 0]); // in RGB
  }
</script>
