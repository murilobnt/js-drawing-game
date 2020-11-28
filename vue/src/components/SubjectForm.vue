<template>
  <form @submit.prevent="onSubmit">
    <h2>Add subject</h2>
    <Input
      type="textarea"
      label="Subject"
      v-model="subject"
      placeholder="Type the drawing subject"
      isRequired="true"
      :error="error"
      @input="touched = true"
      @blur="checkField('subject')"
    />

    <input type="submit" value="Add" />
    <button @click="$emit('cancel')" type="button">Cancelar</button>
  </form>
</template>

<script>
import Input from '../forms/Input'
import { minLengthValidation } from '../forms/validations'

const validate = {
  subject: (value) => minLengthValidation(3, value)
}

export default {
  components: { Input },
  data: () => ({
    subject: '',
    error: null,
    touched: false
  }),
  methods: {
    checkField(name) {
      const error = validate[name] ? validate[name](this.subject) : null
      const nameError = this.touched ? error : null
      this.error = nameError
    },
    onSubmit() {
      this.touched = true
      this.checkField('subject')
      console.log(this.error)
      if(!this.error){
        console.log("Good to go!")
      }
    }
  }
}
</script>

<style scoped>
.form-item {
  display: flex;
  margin-bottom: 1.7rem;
}
</style>
