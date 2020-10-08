<template>
  <div>
    <h2>Welcome!</h2>
    <p>Type in your username:</p>
    <input type='text' v-on:input="$emit('on_name_change', $event.target.value)" />
    <p>First, specify your role</p>
    <button :disabled="p_disabled" v-on:click="$emit('on_join_players')">Player</button>
    <button :disabled="v_disabled" v-on:click="$emit('on_join_voters')">Voter</button>
  </div>
</template>

<script>
export default{
  props: ['p_disabled', 'v_disabled']
}
</script>
