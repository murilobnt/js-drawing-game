import { Component } from '@angular/core'
import { SubjectsService } from './subjectlist.service'

@Component({
  selector: 'subjectlist',
  template: `
    <div *ngIf="mode === 'view'">
      <h2>Subjects</h2>
      <button (click)="addSubject()">Add subject</button>
      <p *ngFor="let subject of subjectService.subjects; index as i">
        <b>P: </b> {{ subject }}
        <button className="m5" (click)="editSubject(i)">
          Edit
        </button>
        <button className="m5" (click)="removeSubject(i)">
          Remove
        </button>
        <br />
      </p>
    </div>
    <div *ngIf="mode !== 'view'">
      <subjectform
        [subject]="subjectService.subjects[current]"
        (update)="updateChanges($event)"
        (cancel)="cancelChanges($event)"
      ></subjectform>
    </div>
  `
})
export class SubjectListComponent {
  mode = 'view'
  current = null

  constructor(public subjectService: SubjectsService) {}

  addSubject() {
    this.mode = 'add'
    this.subjectService.createSubject()
    this.current = this.subjectService.subjects.length - 1
  }

  editSubject(index) {
    this.current = index
    this.mode = 'edit'
    console.log(this.subjectService.subjects[this.current])
  }

  removeSubject(index) {
    this.subjectService.deleteSubject(index)
  }

  updateChanges(subject) {
    this.subjectService.updateSubject(subject, this.current)
    this.mode = 'view'
  }

  cancelChanges() {
    if (this.mode === 'add') {
      this.subjectService.deleteSubject(this.subjectService.subjects.length - 1)
    }
    this.mode = 'view'
  }
}
