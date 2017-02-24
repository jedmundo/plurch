import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeFormat'
})
export class TimeFormatPipe implements PipeTransform {

    transform(seconds: number): string {
        return this.hhmmss(seconds);
    }

    private pad(num: number): string {
        if (num < 10) {
            return '0' + num;
        } else {
            return ''+ num;
        }
    }
    private hhmmss(secs: number) {
        let minutes = Math.floor(secs / 60);
        // secs = secs % 60;
        const hours = Math.floor(minutes / 60);
        // minutes = minutes % 60;

        secs = Math.floor(secs);

        if (hours > 0) {
            return this.pad(hours) + ":" + this.pad(minutes) + ":" + this.pad(secs);
        } else {
            return this.pad(minutes) + ":" + this.pad(secs);
        }
    }

}
