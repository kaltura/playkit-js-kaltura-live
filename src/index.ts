/// <reference path="./global.d.ts" />

import {KalturaLivePlugin} from './kaltura-live-plugin';

declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {KalturaLivePlugin as Plugin};
export {VERSION, NAME};

const pluginName: string = 'kaltura-live';
KalturaPlayer.core.registerPlugin(pluginName, KalturaLivePlugin);
