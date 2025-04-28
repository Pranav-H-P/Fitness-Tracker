import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TabData } from '../../models';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-page-tab',
  standalone: true,
  imports: [NgClass],
  templateUrl: './page-tab.component.html',
  styleUrl: './page-tab.component.scss',
})
export class PageTabComponent {
  @Input({ required: true }) tabData: Array<TabData> = [];
  @Input({ required: true }) currentTab: number = 0;
  @Output() changeTab = new EventEmitter<number>();

  tabClicked(i: number) {
    this.changeTab.emit(i);
  }
}
