<div>
  {#each Object.entries(game_content) as [key, item]}
    {#if key !== '[object Object]'}
      <h2> Players were prompted to draw a {key}!</h2>
      <p> This is what they did: </p>
      <table>
        <tbody>
          {#each item as data}
            <tr>
              <td>
                <img width=100 src={data.img} />
              </td>
              <td>
                <button disabled={disabled[key]}
                        on:click={() => (dispatch('cast_vote', {'subject' : key, 'player_name' : data.from}))} >
                   Vote this!
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {/each}
  <button on:click={() => (dispatch('finish'))}>Finish!</button>
</div>

<script>
  import { createEventDispatcher } from 'svelte'

  export let game_content
  export let votes
  export let disabled

  const dispatch = createEventDispatcher()
</script>
