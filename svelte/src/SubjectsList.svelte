{#if mode === 'view'}
<h2>Subjects</h2>
<button on:click={addSubject}>Add subject</button>
{#each $subjectsList as subject, index}
	<p>
		<b>P: </b> { subject }
		<button className="m5" on:click={e=> editSubject(index)}>Edita</button>
		<button className="m5" on:click={e=> removeSubject(index)}>Remove</button>
		<br />
	</p>
{/each}
{:else}
<SubjectForm subject={$subjectsList[current]} on:update={updateChanges} on:cancel={cancelChanges} />
{/if}

<script>
  import {
    subjectList,
    createSubjectList
  } from './subjects.js'
  import SubjectForm from './SubjectForm.svelte'

  let mode = 'view'
  let current = null

  let subjectsList = createSubjectList()

  function addSubject() {
    mode = 'add'
    subjectsList.create()
    current = $subjectsList.length - 1
  }

  function editSubject(index) {
    current = index
    mode = 'edit'
  }

  function removeSubject(index) {
    subjectsList.remove(index)
  }

  function updateChanges({ detail }) {
    subjectsList.change(detail, current)
    mode = 'view'
  }

  function cancelChanges() {
    if (mode === 'add') {
      removeSubject($subjectsList.length - 1)
    }
    mode = 'view'
  }
</script>
