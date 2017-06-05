import { Injectable } from '@angular/core';
import { USE_LOUDNESS } from '../../app.component';

const OVERALL_VOLUME_KEY = 'overall-volume';

@Injectable()
export class AppSettingsService {

    private mainVolume: number;

    constructor() {
        if (!USE_LOUDNESS) {
            return;
        }

        const mainVol = localStorage.getItem(OVERALL_VOLUME_KEY);
        if (!mainVol) {
            loudness.getVolume((err, vol) => this.overallVolume = vol);
        } else {
            this.overallVolume = +mainVol;
        }
    }

    public set overallVolume(volume: number) {
        if (!USE_LOUDNESS) {
            return;
        }

        this.mainVolume = volume;
        loudness.setVolume(volume, (err) => {
            if(err) {
                console.log(err)
            }
        });
        localStorage.setItem(OVERALL_VOLUME_KEY, String(volume));
    }

    public get overallVolume(): number {
        if (!USE_LOUDNESS) {
            return 0;
        }

        return this.mainVolume;
    }

}
