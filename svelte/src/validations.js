export function minLengthValidation(minLength, value) {
  console.log(value)
  if (!value || value.trim().length < minLength) {
    return `This field needs at least ${minLength} characters`
  }
  return null
}

export function requiredValidation(value) {
  if (!value || value.trim() === '') {
    return 'This field is required'
  }
  return null
}
