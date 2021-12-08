import { NgModule } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule} from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatTreeModule
  ],
  exports: [
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatTreeModule
  ]
})
export class MaterialModule {}  