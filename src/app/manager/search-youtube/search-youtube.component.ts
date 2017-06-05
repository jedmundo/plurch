import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import {
    YouTubeVideo, YoutubeManagementService, YoutubeAutoSuggestion
} from '../../shared/services/youtube-management.service';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { setTimeout } from 'timers';
const { remote } = electron;

@Component({
    selector: 'app-search-youtube',
    templateUrl: 'search-youtube.component.html',
    styleUrls: ['search-youtube.component.scss']
})
export class SearchYoutubeComponent implements OnInit, OnDestroy {

    public searchInputControl = new FormControl();

    public youtubeAutoSuggest$: Observable<YoutubeAutoSuggestion[]>;
    public searchResults: YouTubeVideo[];
    public searchValue: string;
    public chosenFolder: string;

    public autoSuggestVisible: boolean = false;

    private searchSubscription: Subscription;

    constructor(
        private zone: NgZone,
        private youtubeManagementService: YoutubeManagementService) {
    }

    public ngOnInit() {
        this.chosenFolder = this.youtubeManagementService.youtubeVideosFolder;
        this.searchSubscription = this.searchInputControl.valueChanges
            .subscribe((value) => {
                this.searchValue = value;
                this.autoSuggestVisible = true;
            });

        this.youtubeAutoSuggest$ = this.searchInputControl.valueChanges
            .debounceTime(700)
            .distinctUntilChanged()
            .switchMap(term => this.youtubeManagementService.getSuggestions(term));
    }

    public ngOnDestroy(): void {
        this.searchSubscription.unsubscribe();
    }

    public downloadVideo(youtubeVideo: YouTubeVideo): void {
        this.youtubeManagementService.downloadYoutubeVideo(youtubeVideo);
    }

    public pickSuggestion(suggestion: YoutubeAutoSuggestion): void {
        this.searchValue = suggestion.name;
        this.searchInputControl.setValue(this.searchValue, { emitEvent: false });
        this.searchVideos()
    }

    public searchVideos(): void {
        this.youtubeManagementService.searchVideo(this.searchValue)
            .then((results) => {
                    this.searchResults = results
                        .map((video) => this.youtubeManagementService.parseVideo(video))
                        .filter((video) => !!video)
                }
            );
    }

    public openChooseItemDialog() {
        remote.dialog.showOpenDialog({
            title: "Select folder to store videos",
            properties: ["openDirectory"]
        }, (folder) => {
            this.zone.run(() => {
                this.chosenFolder = folder;
                this.youtubeManagementService.videosFolder = folder;
            });
        });
    }

    public hideAutoSuggestList(): void {
        // TODO: Ugly
        setTimeout(() => {
            this.autoSuggestVisible = false;
        }, 500);
    }

    public formatDate(ISO_8601_date: string): string {
        return new Date(ISO_8601_date).toDateString();
    }

}
