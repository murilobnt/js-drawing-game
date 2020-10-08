import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'results',
  template: `
  <div>
    <h2>Results!</h2>
    <h3>Podium</h3>
      <p *ngFor="let item of podium | keyvalue" :style="font_size[item.key]">
        In the {{prefix[item.key]}} place: {{item.value[0]}}, with {{item.value[1]}} vote(s)!
      </p>
    <button (click)="reset_client.emit()">Main Menu</button>
  </div>
  `
})

export class ResultsDisplayerComponent {
  @Input() results: any
  @Output() reset_client = new EventEmitter()

  podium = {}
  font_size = ['200%', '150%', '125%']
  prefix = ['1st', '2nd', '3rd']

  ngOnInit(){
    let local_res = this.results
    let items = Object.keys(local_res).map(function(key) {
      return [key, local_res[key]];
    });

    items.sort(function(first, second) {
      return second[1] - first[1];
    });

    this.podium = items.slice(0, 3)
  }
}
