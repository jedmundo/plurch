// Typings reference file, you can add your own global typings here
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html

declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare let fs: any;
declare let path: any;
declare let ytdl: any;
declare let loudness: any;
