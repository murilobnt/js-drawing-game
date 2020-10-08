<template>
  <div>
    <div v-if="this.game_state === 'menu'">
      <GameMenu @on_name_change="on_name_change"
                @on_join_players="on_join_players"
                @on_join_voters="on_join_voters"
                :p_disabled="this.name.length === 0 || !connected"
                :v_disabled="!connected" />
    </div>

    <div v-if="this.game_state === 'waiting_screen'">
      <h2>Please wait...</h2>
      <p>{{this.await_reason}}</p>
    </div>

    <div v-if="this.game_state === 'drawing'" >
      <DrawingBoard :subject="this.subjects[this.subject_index]" @on_next="on_next" />
    </div>

    <div v-if="this.game_state === 'votes'" >
      <VoteDrawings :game_content="this.game_content"
                    :votes="this.votes"
                    @cast_vote="cast_vote"
                    @on_finish="on_finish" />
    </div>

    <div v-if="this.game_state === 'results'">
      <ResultsDisplayer v-if="this.results" :results="this.results" @reset_client="reset_client" />
    </div>
  </div>
</template>

<script>
import DrawingBoard from './DrawingBoard.vue'
import GameMenu from './GameMenu.vue'
import VoteDrawings from './VoteDrawings.vue'
import ResultsDisplayer from './ResultsDisplayer.vue'

export default {
  components: {
    DrawingBoard,
    GameMenu,
    VoteDrawings,
    ResultsDisplayer
  },

  data: () => ({
    game_state : 'menu',
    name : '',
    connected: false,
    subject_index : 0,
    game_content : {},
    votes : {},
    await_reason: '',
    subjects: [],
    ws : null,
    disabled : {}
  }),

  mounted: function() {
    this.connect()
    this.cli_hash = Math.random().toString(36).substring(7)
    this.votes_on_player = {}
    this.results = {}
  },

  methods: {
    on_next(img){
      const subject = this.subjects[this.subject_index];
      this.ws.send(JSON.stringify({action: 'send_drawing', subject: subject, img:img, cli_hash: this.cli_hash}))
      this.game_state = 'waiting_screen'
      this.await_reason = 'Waiting for all drawers to finish.'
    },

    on_join_players(){
      this.game_state = 'waiting_screen'
      this.await_reason = 'Waiting more players.'
      this.ws.send(JSON.stringify({action: 'join_players', name: this.name, cli_hash: this.cli_hash}));
    },

    on_join_voters(){
      this.game_state = 'waiting_screen'
      this.await_reason = 'Waiting for players to finish their drawings.'
      this.ws.send(JSON.stringify({action: 'join_voters'}));
    },

    on_name_change(name){
      this.name = name
    },

    cast_vote(subject, player_name){
      if(this.disabled[subject]) {
        alert("Already voted in this category.")
        return
      }
      let local_votes = this.votes;
      local_votes[subject] = player_name;

      this.votes_on_player[player_name] = this.votes_on_player[player_name] + 1;
      this.votes = local_votes
      this.disabled[subject] = true
    },

    on_finish(){
      this.game_state = 'waiting_screen'
      this.await_reason = 'Waiting for all voters to cast their votes.'
      this.ws.send(JSON.stringify({action: 'end_votes', votes: this.votes_on_player}));
    },

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
    },

    handle_received_message(message){
      const j_message = JSON.parse(message.data);
      switch(j_message.about){
        case 'abort_game':
          this.reset_client();
          alert(j_message.reason + ". Finishing the game...");
        break;
        case 'start_drawing':
          this.game_state = 'drawing'
          this.subjects = j_message.subjects
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
    },

    connect(){
      let HOST = window.location.origin.replace(/^http/, 'ws').replace(/:8080/, ':30000')
      this.ws = new WebSocket(HOST);

      this.ws.onopen = () => {
        this.connected = true
      }

      this.ws.onmessage = this.handle_received_message
    }
  }
}
</script>
