/// <reference path="../node_modules/@playkit-js-contrib/common/player-internals.d.ts" />

// TODO sakal review everything here

declare module "*.scss" {
    const content: { [className: string]: string };
    export = content;
}

declare module "*.svg" {
    const content: any;
    export default content;
}
