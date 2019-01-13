import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat'
})
export class TimeFormatPipe implements PipeTransform {

  public transform(seconds: number): string {
    return this.hhmmss(seconds);
  }

  private pad(num: number): string {
    if (num < 10) {
      return '0' + num;
    } else {
      return '' + num;
    }
  }
  private hhmmss(secs: number) {
    const minutes = Math.floor(secs / 60);
    let seconds = Math.floor(secs - minutes * 60);

    const hours = Math.floor(secs / 3600);
    seconds = seconds - hours * 3600;

    if (hours > 0) {
      return this.pad(hours) + ':' + this.pad(minutes) + ':' + this.pad(seconds);
    } else {
      return this.pad(minutes) + ':' + this.pad(seconds);
    }
  }

}
