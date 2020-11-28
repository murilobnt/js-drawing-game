import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { AppComponent } from './app.component';
import { GameStateComponent } from './gamestate.component'
import { GameMenuComponent } from './gamemenu.component'
import { DrawingBoardComponent } from './drawingboard.component'
import { VoteDrawingsComponent } from './votedrawings.component'
import { ResultsDisplayerComponent } from './resultsdisplayer.component'

import { CanvasWhiteboardModule } from 'ng2-canvas-whiteboard';

import { SubjectFormComponent } from './subjectform.component'
import { SubjectListComponent } from './subjectlist.component'
import { InputComponent } from './input.component'

@NgModule({
  declarations: [
    AppComponent,
    GameStateComponent,
    GameMenuComponent,
    DrawingBoardComponent,
    VoteDrawingsComponent,
    ResultsDisplayerComponent,
    SubjectListComponent,
    SubjectFormComponent,
    InputComponent
  ],
  imports: [
    BrowserModule,
    CanvasWhiteboardModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
