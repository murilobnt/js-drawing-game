<h2 *ngIf="content !== '[object Object]'"> Players were prompted to draw a {{content}}!</h2>
<p *ngIf="content !== '[object Object]'"> This is what they did: </p>
<table>
  <tbody>
    <tr *ngFor="let data in game_content[content]">
      <td><img alt="drawing" [src]="game_content[content][data].img" /></td>
      <td>
        <button [disabled]="disabled[content]"
                (click)="cast_vote.emit({'subject' : content, 'player_name' : game_content[content][data].from})" >
           Vote this!
        </button>
      </td>
    </tr>
  </tbody>
</table>
<button (click)="on_finish.emit()">Finish!</button>

<td><img alt="drawing" [src]="game_content[content][data].img" /></td>
<td>
  <button [disabled]="disabled[content]"
          (click)="cast_vote.emit({'subject' : content, 'player_name' : game_content[content][data].from})" >
     Vote this!
  </button>
</td>
