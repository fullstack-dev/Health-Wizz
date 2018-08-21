import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class HistoryProvider {

  histories: Array<string>;

  constructor(public http: HttpClient) {
    // default history is home page for all pages
    this.histories = ['HomePage'];
  }

  addHistory(view: string) {
    let _view = '';
    if (view != null && view != undefined) {
      _view = view.trim();
    }
    if (_view != '') {
      this.histories.push(_view);
    } else {
      this.histories.push('HomePage');
    }
  }

  getHistory(): string {
    let top_index = this.histories.length - 1;
    let top_view = this.histories[top_index];
    this.clearHistoryAtIndex(top_index);
    return top_view;
  }

  clearHistory() {
    this.histories = ['HomePage'];
  }

  clearHistoryAtIndex(index: number) {
    this.histories.splice(index, 1);
  }

}
