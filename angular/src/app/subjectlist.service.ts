import { Injectable } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class SubjectsService {
  subjects = []

  createSubject() {
    this.subjects.push('')
  }

  updateSubject(subject, index) {
    this.subjects[index] = subject
  }

  deleteSubject(index) {
    this.subjects.splice(index, 1)
  }
}
