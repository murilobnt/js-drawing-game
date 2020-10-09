<div>
    <h2>Results!</h2>
      <h3>Podium</h3>
        {#each Object.entries(podium) as [key, item]}
          <p style="font-size: {font_size[key]}">
            In the {prefix[key]} place: {item[0]}, with {item[1]} vote(s)!
          </p>
        {/each}
      <button on:click={() => (dispatch('reset_client'))}>Main Menu</button>
</div>

<script>
  import { createEventDispatcher, onMount } from 'svelte'

  let podium = {}
  const font_size = ['200%', '150%', '125%']
  const prefix = ['1st', '2nd', '3rd']

  export let results
  const dispatch = createEventDispatcher()

  onMount(() => (setup()))

  function setup(){
    let local_res = results
    let items = Object.keys(local_res).map(function(key) {
      return [key, local_res[key]];
    });

    items.sort(function(first, second) {
      return second[1] - first[1];
    });

    podium = items.slice(0, 3)
  }

</script>
