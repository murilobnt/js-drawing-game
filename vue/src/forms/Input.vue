<template>
  <div className="form-item">
    <label>
      {{ label }}
      <span v-if="isRequired" style="color: red">*</span>
    </label>
    <div>
      <textarea
        v-if="type === 'textarea'"
        rows="4"
        :placeholder="placeholder"
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', name)"
      />
      <input
        v-else
        type="text"
        :placeholder="placeholder"
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', name)"
      />
      <div class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script scoped>
export default {
  props: [
    'type', // input (detfault) ou textarea
    'label', // label (opcional)
    'placeholder',
    'isRequired',
    'touched',
    'error',

    'modelValue'
  ]
  // methods: {
  //   onChange(event) {
  //     this.$emit('update:modelValue', event.target.value)
  //     // this.$emit('change', this.name)
  //   }
  // }
  // data() {
  //   console.log(this.values)

  //   return {
  //     value: this.values[this.name]
  //   }
  // },
  // computed: {
  //   value() {
  //     return this.values[this.name]
  //   },
  //   updateName() {
  //     return `update:${this.name}`
  //   }
  // }
}
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
</style>
