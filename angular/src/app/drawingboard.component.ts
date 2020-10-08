import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core'
import {
  CanvasWhiteboardComponent,
  CanvasWhiteboardService,
  CanvasWhiteboardUpdate,
  CanvasWhiteboardOptions
} from 'ng2-canvas-whiteboard'

@Component({
  selector: 'drawing_board',
  viewProviders: [CanvasWhiteboardComponent],
  template: `
  <div>
    <h2>Draw a {{subject}}!</h2>
    <canvas-whiteboard #canvasWhiteboard
                       [options]="canvas_options">
    </canvas-whiteboard>
    <button (click)="on_next.emit(this.canvas_whiteboard.generateCanvasDataUrl())"> Next! </button>
  </div>
  `,
  styles: [
    `
    canvas-whiteboard {
      display: block;
      height: 400px;
      width: 400px;
    }
    `
  ]
})

export class DrawingBoardComponent {
  @ViewChild('canvasWhiteboard') canvas_whiteboard : CanvasWhiteboardComponent;
  @Input() subject: string
  @Output() on_next = new EventEmitter<string>()

  canvas_options: CanvasWhiteboardOptions = {
    drawingEnabled: true,
    drawButtonEnabled: false,
    clearButtonEnabled: true,
    clearButtonClass: "clearButtonClass",
    clearButtonText: "Clear",
    undoButtonText: "Undo",
    undoButtonEnabled: true,
    redoButtonText: "Redo",
    redoButtonEnabled: true,
    colorPickerEnabled: true,
    strokeColorPickerText: "Stroke",
    lineWidth: 5,
    strokeColor: "rgb(0,0,0)"
  }
}
