<div>
  {#if game_state === 'menu'}
      <GameMenu on:join_players={on_join_players}
                on:join_voters={on_join_voters}
                on:name_change={on_name_change}
                p_disabled={name.length === 0 || !connected}
                v_disabled={!connected} />
  {/if}

  {#if game_state === 'waiting_screen'}
        <h2>Please wait...</h2>
        <p>{await_reason}</p>
  {/if}

  {#if game_state === 'drawing'}
        <DrawingBoard
        subject={subjects[subject_index]}
        on:next={on_next} />
  {/if}

  {#if game_state === 'votes'}
        <VoteDrawings game_content={game_content}
                      votes={votes}
                      disabled={disabled}
                      on:cast_vote={cast_vote}
                      on:finish={on_finish} />
  {/if}

  {#if game_state === 'results'}
        <ResultsDisplayer results={results} on:reset_client={reset_client} />
  {/if}
</div>

<script>
  import GameMenu from './GameMenu.svelte'
  import DrawingBoard from './DrawingBoard.svelte'
  import VoteDrawings from './VoteDrawings.svelte'
  import ResultsDisplayer from './ResultsDisplayer.svelte'
  import { onMount } from 'svelte';

  let game_state = 'menu'
  let name = ''
  let connected= false
  let subject_index = 0
  let game_content = {}
  let votes = {}
  let await_reason = ''
  let subjects = []
  let ws = null
  let disabled = {}
  let cli_hash = Math.random().toString(36).substring(7)
  let votes_on_player = {}
  let results = {}

  onMount(() => (connect()))

  function on_next(data) {
    let img = data.detail
    const subject = subjects[subject_index];
    ws.send(JSON.stringify({action: 'send_drawing', subject: subject, img:img, cli_hash: cli_hash}))
    game_state = 'waiting_screen'
    await_reason = 'Waiting for all drawers to finish.'
  }

  function on_join_players() {
    game_state = 'waiting_screen'
    await_reason = 'Waiting more players.'
    ws.send(JSON.stringify({action: 'join_players', name: name, cli_hash: cli_hash}));
  }

  function on_join_voters(){
    game_state = 'waiting_screen'
    await_reason = 'Waiting for players to finish their drawings.'
    ws.send(JSON.stringify({action: 'join_voters'}));
  }

  function on_name_change(_name){
    name = _name.detail
  }

  function cast_vote(_data){
    let data = _data.detail
    if(disabled[data.subject]) {
      alert("Already voted in this category.")
      return
    }

    let local_votes = votes;
    local_votes[data.subject] = data.player_name;

    votes_on_player[data.player_name] = votes_on_player[data.player_name] + 1;
    votes = local_votes
    disabled[data.subject] = true
  }

  function on_finish(){
    game_state = 'waiting_screen'
    await_reason = 'Waiting for all voters to cast their votes.'
    ws.send(JSON.stringify({action: 'end_votes', votes: votes_on_player}));
  }

  function reset_client(){
    game_state = 'menu'
    name = ''
    connected= false
    subject_index = 0
    game_content = {}
    votes = {}
    await_reason = ''
    subjects = []
    votes_on_player = {}
    results = {}
    disabled = {}
    connect()
  }

  function handle_received_message(message){
    const j_message = JSON.parse(message.data);
    switch(j_message.about){
      case 'abort_game':
        reset_client();
        alert(j_message.reason + ". Finishing the game...");
      break;
      case 'start_drawing':
        subjects = j_message.subjects
        game_state = 'drawing'
      break;
      case 'next_drawing':
      if(subject_index === subjects.length - 1){
        game_state = 'waiting_screen'
        await_reason = 'Waiting for all voters to cast their votes.'
        ws.send(JSON.stringify({action: 'ready_for_votes'}));
      } else {
        subject_index = subject_index + 1
        game_state = 'drawing'
      }
      break;
      case 'votes':
        j_message.player_names.forEach((player) => {
          votes_on_player[player] = 0;
          for (let subject in subjects) {
            disabled[subject] = false
          }
        })
        game_state = 'votes'
        game_content = j_message.content
      break;
      case 'end_game':
        results = j_message.result;
        game_state = 'results'
      break;
      default:
      break;
    }
  }

  function connect(){
    let HOST = window.location.origin.replace(/^http/, 'ws').replace(/:5000/, ':30000')
    ws = new WebSocket(HOST);

    ws.onopen = () => {
      connected = true
    }

    ws.onmessage = (msg) => (handle_received_message(msg))
  }
</script>
