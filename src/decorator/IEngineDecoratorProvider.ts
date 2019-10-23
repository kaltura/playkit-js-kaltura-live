// TODO - consult Eran if we need entire interface / use 'any' and/or host in contrib
export interface IEngineDecorator {
    active: boolean;
    dispatchEvent(event: FakeEvent): boolean;
    restore?: (source: any, config: Object) => void;
    reset?: () => void;
    destroy?: () => void;
    attach?: () => void;
    detach?: () => void;
    getVideoElement?: () => HTMLVideoElement;
    selectVideoTrack?: (videoTrack: VideoTrack) => void;
    selectAudioTrack?: (audioTrack: AudioTrack) => void;
    selectTextTrack?: (textTrack: TextTrack) => void;
    hideTextTrack?: () => void;
    enableAdaptiveBitrate?: () => void;
    isAdaptiveBitrateEnabled?: () => boolean;
    seekToLiveEdge?: () => void;
    getStartTimeOfDvrWindow?: () => number;
    isLive?: () => boolean;
    play?: () => void;
    pause?: () => void;
    load?: (startTime?: number) => Promise<Object>;
    enterPictureInPicture?: () => void;
    exitPictureInPicture?: () => void;
    isPictureInPictureSupported?: () => boolean;
    resetAllCues?: () => void;
    id?: string;
    src?: string;
    currentTime?: number;
    duration?: number;
    volume?: number;
    paused?: boolean;
    seeking?: boolean;
    seekable?: TimeRanges;
    played?: TimeRanges;
    buffered?: TimeRanges;
    muted?: boolean;
    defaultMuted?: boolean;
    poster?: string;
    preload?: string;
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
    playbackRates?: Array<number>;
    playbackRate?: number;
    defaultPlaybackRate?: number;
    ended?: boolean;
    error?: MediaError;
    networkState?: number;
    readyState?: number;
    videoHeight?: number;
    videoWidth?: number;
    playsinline?: boolean;
    crossOrigin?: string;
    isInPictureInPicture?: boolean;
    targetBuffer?: number;
    availableBuffer?: number;
}

export interface IEngineDecoratorProvider {
    getEngineDecorator(engine: any, dispatchEventHandler: Function): IEngineDecorator;
}
