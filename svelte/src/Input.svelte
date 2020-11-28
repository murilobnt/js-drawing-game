<div class="form-item">
	<label>
		{ label }
		{#if isRequired}
		<span style="color: red">*</span>
		{/if}
	</label>
	<div>
		{#if type === 'textarea'}
		<textarea rows="4" class={error ? 'input-error' : '' } {placeholder} bind:value={value} on:input on:blur />
		{:else}
		  <input
        type="text"
        class={error ? 'input-error' : ''}
        {placeholder}
        bind:value={value}
        on:input
        on:blur />
    {/if}
    <div class="error">{ error || '' }</div>
  </div>
</div>

<script>
  export let type = 'input'
  export let label = ''
  export let placeholder = ''
  export let value = ''
  export let isRequired = false
  export let error = ''
</script>

<style>
  label {
    min-width: 6rem;
    text-align: right;
    margin-right: 5px;
    font-weight: bold;
  }
  .error {
    position: absolute;
    color: red;
    font-style: italic;
    font-size: smaller;
  }
  input[type='text'],
  textarea {
    border-radius: 3px;
    font-size: 12pt;
    font-family: Arial, Helvetica, sans-serif;
    width: 18rem;
    border: 1px solid #aaa;
    padding: 0.2em;
    color: #444;
  }
  .input-error {
    border: 1px solid red !important;
  }
  .form-item {
    display: flex;
    margin-bottom: 1.7rem;
  }
</style>
