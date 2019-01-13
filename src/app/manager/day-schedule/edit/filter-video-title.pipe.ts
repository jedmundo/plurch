import { Pipe, PipeTransform } from '@angular/core';

import { YouTubeVideo } from '../../../shared/services/youtube-management.service';

@Pipe({
  name: 'searchedItems'
})
export class SearchedItemsPipe implements PipeTransform {
  public transform(allVideos: YouTubeVideo[], search: string) {
    if (!search) {
      return allVideos;
    } else {
      return allVideos.filter(video => video.title.toLowerCase().indexOf(search.toLowerCase()) > -1);
    }
  }
}
