import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'menu',
  template: `
  <div>
    <h2>Welcome!</h2>
    <p>Type in your username:</p>
    <input type='text' (input)="on_name_change.emit($event.target.value)" />
    <p>First, specify your role</p>
    <button [disabled]="p_disabled" (click)="on_join_players.emit()">Player</button>
    <button [disabled]="v_disabled" (click)="on_join_voters.emit()">Voter</button>
  </div>
  `
})

export class GameMenuComponent {
  @Input() p_disabled: boolean
  @Input() v_disabled: boolean
  @Output() on_name_change = new EventEmitter<string>()
  @Output() on_join_players = new EventEmitter()
  @Output() on_join_voters = new EventEmitter()
}
