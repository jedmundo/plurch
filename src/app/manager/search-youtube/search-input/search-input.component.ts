import {
    Component, OnInit, NgZone, OnDestroy, Output,
    EventEmitter
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { setTimeout } from 'timers';
import {
    YoutubeAutoSuggestion, YoutubeManagementService,
    YouTubeVideo
} from '../../../shared/services/youtube-management.service';
import { distinctUntilChanged, debounceTime, switchMap } from 'rxjs/operators';
import { ElectronService } from '../../../shared/services/electron.service';

@Component({
    selector: 'pl-search-youtube-input',
    templateUrl: 'search-input.component.html',
    styleUrls: ['search-input.component.scss']
})
export class SearchYoutubeInputComponent implements OnInit, OnDestroy {

    @Output() public resultsEmitter = new EventEmitter<YouTubeVideo[]>();

    public searchInputControl = new FormControl();

    public youtubeAutoSuggest$: Observable<YoutubeAutoSuggestion[]>;
    public searchValue: string;
    public chosenFolder: string;

    public autoSuggestVisible = false;

    private searchSubscription: Subscription;

    constructor(
        private zone: NgZone,
        private electronService: ElectronService,
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
            .pipe(
                debounceTime(700),
                distinctUntilChanged(),
                switchMap(term => this.youtubeManagementService.getSuggestions(term))
            );
    }

    public ngOnDestroy(): void {
        this.searchSubscription.unsubscribe();
    }

    public pickSuggestion(suggestion: YoutubeAutoSuggestion): void {
        this.searchValue = suggestion.name;
        this.searchInputControl.setValue(this.searchValue, { emitEvent: false });
        this.searchVideos();
    }

    public searchVideos(): void {
        this.youtubeManagementService.searchVideo(this.searchValue)
            .then((results) => {
                this.resultsEmitter.emit(results
                    .map((video) => this.youtubeManagementService.parseVideo(video))
                    .filter((video) => !!video));
            }
            );
    }

    public openChooseItemDialog() {
        this.electronService.remote.dialog.showOpenDialog({
            title: 'Select folder to store videos',
            properties: ['openDirectory']
        }, (folder) => {
            this.zone.run(() => {
                this.chosenFolder = folder[0];
                this.youtubeManagementService.videosFolder = folder[0];
            });
        });
    }

    public hideAutoSuggestList(): void {
        // TODO: Ugly
        setTimeout(() => {
            this.autoSuggestVisible = false;
        }, 500);
    }

}
