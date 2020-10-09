<div>
    <h2>Welcome!</h2>
    <p>Type in your username:</p>
    <input type='text' on:input={(event) => (dispatch('name_change', event.target.value))} />
    <p>First, specify your role</p>
    <button disabled={p_disabled} on:click={() => (dispatch('join_players'))}>Player</button>
    <button disabled={v_disabled} on:click={() => (dispatch('join_voters'))}>Voter</button>
</div>

<script>
  import { createEventDispatcher } from 'svelte'
  export let p_disabled
  export let v_disabled
  const dispatch = createEventDispatcher()
</script>
