import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'subjectform',
  template: `
    <form #subjectForm="ngForm" (ngSubmit)="subjectForm.form.valid && onSubmit()">
    <h2>Add subject</h2>
      <subjectinput
        type="textarea"
        label="Subject"
        placeholder="Type the drawing subject"
        isRequired="true"
        minlength="3"
        name="subject"
        [(value)]="subject"
      ></subjectinput>
      <input type="submit" value="Add" />
      <button type="button" (click)="cancel.emit()">Cancel</button>
    </form>
  `
})
export class SubjectFormComponent implements OnInit {
  @Input() subject: string
  @Output() update = new EventEmitter()
  @Output() cancel = new EventEmitter()
  subj

  ngOnInit() {
    this.subj = ''
  }

  onSubmit() {
    console.log("Ready to go!")
  }
}
