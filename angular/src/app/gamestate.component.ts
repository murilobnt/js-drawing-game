import { Component } from '@angular/core'

@Component({
  selector: 'state',
  template: `
  <div>
    <div *ngIf="game_state === 'menu'">
      <menu (on_name_change)="on_name_change($event)"
            (on_join_players)="on_join_players()"
            (on_join_voters)="on_join_voters()"
            [p_disabled]="name.length === 0 || !connected"
            [v_disabled]="!connected">
      </menu>
    </div>

    <div *ngIf="game_state === 'waiting_screen'">
      <h2>Please wait...</h2>
      <p>{{this.await_reason}}</p>
    </div>

    <div *ngIf="game_state === 'drawing'" >
      <drawing_board [subject]="subjects[subject_index]" (on_next)="on_next($event)">
      </drawing_board>
    </div>

    <div *ngIf="game_state === 'votes'" >
      <votes [game_content]="game_content"
             [votes]="votes"
             [disabled]="disabled"
             (cast_vote)="cast_vote($event)"
             (on_finish)="on_finish()">
      </votes>
    </div>

    <div *ngIf="this.game_state === 'results'">
      <results [results]="this.results" (reset_client)="reset_client()">
      </results>
    </div>

  </div>
  `
})

export class GameStateComponent {
  game_state = 'menu'
  name = ''
  connected= false
  subject_index = 0
  game_content = {}
  votes = {}
  await_reason = ''
  subjects = []
  ws = null
  disabled = {}
  cli_hash = Math.random().toString(36).substring(7)
  votes_on_player = {}
  results = {}

  constructor(){
    this.connect()
  }

  on_next(img){
    console.log("Received img: " + img)
    const subject = this.subjects[this.subject_index];
    this.ws.send(JSON.stringify({action: 'send_drawing', subject: subject, img:img, cli_hash: this.cli_hash}))
    this.game_state = 'waiting_screen'
    this.await_reason = 'Waiting for all drawers to finish.'
  }

  on_join_players(){
    this.game_state = 'waiting_screen'
    this.await_reason = 'Waiting more players.'
    this.ws.send(JSON.stringify({action: 'join_players', name: this.name, cli_hash: this.cli_hash}));
  }

  on_join_voters(){
    this.game_state = 'waiting_screen'
    this.await_reason = 'Waiting for players to finish their drawings.'
    this.ws.send(JSON.stringify({action: 'join_voters'}));
  }

  on_name_change(name){
    this.name = name
  }

  cast_vote(data){
    if(this.disabled[data.subject]) {
      alert("Already voted in this category.")
      return
    }

    let local_votes = this.votes;
    local_votes[data.subject] = data.player_name;

    this.votes_on_player[data.player_name] = this.votes_on_player[data.player_name] + 1;
    this.votes = local_votes
    this.disabled[data.subject] = true
  }

  on_finish(){
    this.game_state = 'waiting_screen'
    this.await_reason = 'Waiting for all voters to cast their votes.'
    this.ws.send(JSON.stringify({action: 'end_votes', votes: this.votes_on_player}));
  }

  reset_client(){
    this.game_state = 'menu'
    this.name = ''
    this.connected= false
    this.subject_index = 0
    this.game_content = {}
    this.votes = {}
    this.await_reason = ''
    this.subjects = []
    this.votes_on_player = {}
    this.results = {}
    this.disabled = {}
    this.connect()
  }

  handle_received_message(message){
    const j_message = JSON.parse(message.data);
    switch(j_message.about){
      case 'abort_game':
        this.reset_client();
        alert(j_message.reason + ". Finishing the game...");
      break;
      case 'start_drawing':
        console.log(this.game_state)
        this.subjects = j_message.subjects
        this.game_state = 'drawing'
      break;
      case 'next_drawing':
      if(this.subject_index === this.subjects.length - 1){
        this.game_state = 'waiting_screen'
        this.await_reason = 'Waiting for all voters to cast their votes.'
        this.ws.send(JSON.stringify({action: 'ready_for_votes'}));
      } else {
        this.subject_index = this.subject_index + 1
        this.game_state = 'drawing'
      }
      break;
      case 'votes':
        j_message.player_names.forEach((player) => {
          this.votes_on_player[player] = 0;
          for (let subject in this.subjects) {
            this.disabled[subject] = false
          }
        })
        this.game_state = 'votes'
        this.game_content = j_message.content
      break;
      case 'end_game':
        this.results = j_message.result;
        this.game_state = 'results'
      break;
      default:
      break;
    }
  }

  connect(){
    let HOST = window.location.origin.replace(/^http/, 'ws').replace(/:4200/, ':30000')
    this.ws = new WebSocket(HOST);

    this.ws.onopen = () => {
      this.connected = true
    }

    this.ws.onmessage = (msg) => (this.handle_received_message(msg))
  }
}
