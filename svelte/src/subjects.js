import { writable } from 'svelte/store'

export const subjectList = writable([])

export function createSubjectList() {
  const { subscribe, update } = writable([])

  function create() {
    update((list) => [...list, ''])
  }

  function remove(index) {
    update((list) => [
      ...list.slice(0, index),
      ...list.slice(index + 1)
    ])
  }

  return { subscribe, create, remove }
}
