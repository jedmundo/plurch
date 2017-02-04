import { Component, OnInit, NgZone } from '@angular/core';
import Display = Electron.Display;

@Component({
    selector: 'app-monitor-displays',
    templateUrl: './monitor-displays.component.html',
    styleUrls: ['./monitor-displays.component.scss']
})
export class MonitorDisplaysComponent implements OnInit {

    public displays: PlurchDisplay[] = [];

    constructor(private zone: NgZone) { }

    public ngOnInit() {
        const electronScreen = electron.screen;

        const connectedDisplays = electronScreen.getAllDisplays();
        connectedDisplays.forEach((display) => {
            this.displays.push(new PlurchDisplay(display));
        });

        electronScreen.on('display-added', (event: Event, newDisplay: Display) => {
            this.zone.run(() => {
                console.log('Display Added', newDisplay);
                this.displays.push(new PlurchDisplay(newDisplay))
            });
        });

        electronScreen.on('display-removed', (event: Event, oldDisplay: Display) => {
            this.zone.run(() => {
                console.log('Display Removed', oldDisplay);
                this.displays.splice(this.displays.findIndex((display) => display.electronDisplay.id === oldDisplay.id), 1);
            });
        });
    }

}

export class PlurchDisplay {

    public external: boolean;

    constructor(public electronDisplay: Display) {
        this.external = this.isExternal(electronDisplay);
    }

    private isExternal(electronDisplay: Display): boolean {
        return electronDisplay.bounds.x != 0 || electronDisplay.bounds.y != 0;
    }
}
