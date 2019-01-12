# Plurch
This is a desktop application used to organize presentations using any media formats: videos, images, power points, etc.
It serves as a way to organize the content you want to present so you don't loose track of whats coming next.

## Features

- Search youtube for videos
- Download videos from youtube
- Create your own groups of videos
- Supports multiple displays where the downloaded videos can be viewed
- Volume control of the laptop (for now only works on osx)

## Install
Simply run `npm install` or `yarn`

## Development server
Run `npm start` and the app will automatically launch in electron with hot reload.

## Running unit tests
Run `npm test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Frameworks/Libraries used
 Angular CLI [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
 Angular7+
 Electron
 Lodash
 ytdl-core
 loudness
 font-awesome
 dragula

## Included Commands

|Command|Description|
|--|--|
|`npm run ng:serve`| Execute the app in the browser |
|`npm run build`| Build the app. Your built files are in the /dist folder. |
|`npm run build:prod`| Build the app with Angular aot. Your built files are in the /dist folder. |
|`npm run electron:local`| Builds your application and start electron
|`npm run electron:linux`| Builds your application and creates an app consumable on linux system |
|`npm run electron:windows`| On a Windows OS, builds your application and creates an app consumable in windows 32/64 bit systems |
|`npm run electron:mac`|  On a MAC OS, builds your application and generates a `.app` file of your application that can be run on Mac |
