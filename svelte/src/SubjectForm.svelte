<form on:submit|preventDefault={submit}>
	<h2>Add subject</h2>
	<Input type="textarea" label="Subject" bind:value={subject} on:input={ () => touched=true } on:blur={e=>
	checkField('subject')} placeholder="Type the drawing subject" isRequired="true" error={error} />
	<button type="submit" value="Add">Add</button>
	<button type="button" on:click={e=> dispatch('cancel')}>Cancel</button>
</form>

<script>
  import {
    minLengthValidation
  } from './validations.js'
  import { createEventDispatcher } from 'svelte'
  import Input from './Input.svelte'

  const validate = {
    subject: value => minLengthValidation(3, value)
  }

  let error = null
  let touched = false
	let subject = ''
  const dispatch = createEventDispatcher()

  function checkField(name) {
    error = null
    if (validate[name] && touched) {
      const value = subject
      error = validate[name](subject)
			console.log(error)
    }
  }

  function submit() {
    checkField('subject')
    if(!error){
      console.log("Ready to go!")
    }
  }
</script>
