<template>
  <div v-if="mode === 'view'">
    <h2>Subjects</h2>
    <button @click="addSubject">Add subject</button>
    <p v-for="(subject, i) in subjects" :key="i">
      <b>P: </b> {{ subject }}
      <button className="m5" @click="editSubject(i)">Edit</button>
      <button className="m5" @click="removeSubject(i)">Remove</button>
      <br />
    </p>
  </div>
  <div v-else>
    <SubjectForm
      :subject="subjects[current]"
    />
  </div>
</template>

<script>
import SubjectForm from './SubjectForm'
import { ref } from 'vue'

import {
  subjects,
  size,
  createSubject,
  updateSubject,
  deleteSubject
} from '../composition/subjects'

export default {
  components: { SubjectForm },
  setup() {
    const mode = ref('view')
    const current = ref(0)

    const addSubject = () => {
      createSubject()
      mode.value = 'add'
      current.value = size.value - 1
    }

    const updateChanges = (subject) => {
      updateSubject(subject, current.value)
      mode.value = 'view'
    }

    const editSubject = (index) => {
      current.value = index
      mode.value = 'edit'
    }

    const removeSubject = (index) => {
      deleteSubject(index)
    }

    const cancelChanges = () => {
      if (mode.value === 'add') {
        deleteSubject(size.value - 1)
      }
      mode.value = 'view'
    }

    return {
      mode,
      subjects,
      current,
      addSubject,
      updateChanges,
      editSubject,
      removeSubject,
      cancelChanges
    }
  }
}
</script>
