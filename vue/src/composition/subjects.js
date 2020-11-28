import { reactive, readonly, computed } from 'vue'

const subjectsList = reactive([])

export const subjects = readonly(subjectsList)
export const size = computed(() => subjectsList.length)

export function createSubject() {
  subjectsList.push({ statement: '', options: [] })
}

export function updateSubject(subject, index) {
  subjectsList[index] = subject
}

export function deleteSubject(index) {
  subjectsList.splice(index, 1)
}
