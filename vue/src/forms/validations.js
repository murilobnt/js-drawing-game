export function minLengthValidation(minLength, value) {
  if (value.trim().length < minLength) {
    return `Este campo requer pelo menos ${minLength} caracteres`
  }
  return null
}

export function requiredValidation(value) {
  if (value.trim() === '') {
    return 'Este campo é obrigatório'
  }
  return null
}
