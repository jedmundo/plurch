import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Renderer } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { VIDEO_COMMAND_TYPE, VideoCommand } from '../../manager/day-schedule/video-item/video-item.component';
import { ElectronService } from '../../shared/services/electron.service';

@Component({
  templateUrl: 'full-screen-video.component.html',
  styleUrls: ['full-screen-video.component.scss']
})
export class FullScreenVideoComponent implements OnInit, OnDestroy {

  @ViewChild('videoPlayer') private videoPlayerRef: ElementRef;

  public videoPath: SafeUrl;

  private itemId: string;
  private windowId: string;

  constructor(
    private electronService: ElectronService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private renderer: Renderer) {
  }

  public ngOnInit(): void {
    this.route.params
      .subscribe((params: Params) => {
        this.videoPath = this.sanitizer.bypassSecurityTrustResourceUrl('file:///' + params['path'].replace(/___/g, '/'));
        this.itemId = params['id'];
        this.windowId = params['windowId'];
      });

    this.electronService.ipcRenderer.on('send-video-type', (event, command: VideoCommand) => {
      const videoElNative = this.videoPlayerRef.nativeElement;
      switch (command.type) {
        case VIDEO_COMMAND_TYPE.PLAY:
          return videoElNative.play();
        case VIDEO_COMMAND_TYPE.PAUSE:
          return videoElNative.pause();
        case VIDEO_COMMAND_TYPE.MUTE:
          return this.renderer.setElementProperty(videoElNative, 'muted', true);
        case VIDEO_COMMAND_TYPE.UNMUTE:
          return this.renderer.setElementProperty(videoElNative, 'muted', false);
        case VIDEO_COMMAND_TYPE.VOLUME:
          return this.renderer.setElementProperty(videoElNative, 'volume', command.value);
        case VIDEO_COMMAND_TYPE.RESTART:
          return videoElNative.load();
        case VIDEO_COMMAND_TYPE.SYNC_TIME:
          this.renderer.setElementProperty(videoElNative, 'currentTime', command.value);
          break;
      }
    });

    this.electronService.ipcRenderer.on('retrieve-video-time', (event, parameters) => {
      if (parameters.itemId === this.itemId && parameters.windowId === this.windowId) {
        this.electronService.ipcRenderer
          .send('respond-video-time', { id: this.itemId, isPaused: video.paused, isMuted: video.muted, time: video.currentTime });
      }
    });

    this.electronService.ipcRenderer.on('remove-item', (event, parameters) => {
      if (parameters.itemId === this.itemId) {
        this.electronService.ipcRenderer.send('removed-item-playing', { id: this.itemId, windowId: this.windowId });
        this.router.navigate(['/fs/empty-window']);
      }
    });

    const video: HTMLMediaElement = this.videoPlayerRef.nativeElement;
    this.electronService.ipcRenderer.send('new-item-playing', { id: this.itemId, windowId: this.windowId, videoElement: video });

    this.renderer.listen(video, 'ended', () => {
      this.router.navigate(['/fs/empty-window']);
    });
  }

  public ngOnDestroy(): void {
    this.electronService.ipcRenderer.send('removed-item-playing', { id: this.itemId, windowId: this.windowId });
  }

}
