import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'votes',
  template: `
  <div>
    <div *ngFor="let item of game_content | keyvalue">
      <h2 *ngIf="item.key !== '[object Object]'"> Players were prompted to draw a {{item.key}}!</h2>
      <p *ngIf="item.key !== '[object Object]'"> This is what they did: </p>
      <table>
        <tbody>
          <tr *ngFor="let data of item.value | keyvalue">
            <td><img width=100 [src]="data.value.img" /></td>
            <td>
              <button disabled="{{disabled[item.key]}}"
                      (click)="cast_vote.emit({'subject' : item.key, 'player_name' : data.value.from})" >
                 Vote this!
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <button (click)="on_finish.emit()">Finish!</button>
  </div>
  `
})

export class VoteDrawingsComponent {
  @Input() game_content: any
  @Input() votes: any
  @Input() disabled: any
  @Output() cast_vote = new EventEmitter<any>()
  @Output() on_finish = new EventEmitter()
}
