# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.7.5](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.7.3...v1.7.5) (2021-11-05)


### Bug Fixes

* **FEV-1103:** incorrect live indicator color (state) appear when changing states between DVR to live ([#43](https://github.com/kaltura/playkit-js-dual-screen/issues/43)) ([b020a2b](https://github.com/kaltura/playkit-js-dual-screen/commit/b020a2b8cb8480bd12073cd1dd54534b207191fc))
* **FEV-1120:** parent and child screens cannot be switched on SBS layout ([#45](https://github.com/kaltura/playkit-js-dual-screen/issues/45)) ([a7c1f95](https://github.com/kaltura/playkit-js-dual-screen/commit/a7c1f95907784881770f8bc3620400470e1e3815))
* **FEV-1127:** slide appear in child container when changing slides in webcast application while producer set "hide slides" mode ([#44](https://github.com/kaltura/playkit-js-dual-screen/issues/44)) ([914225e](https://github.com/kaltura/playkit-js-dual-screen/commit/914225ebcfc18a4c3e97ef9b29e98ae342002bdd))
* **FEV-1130:** Captions disappear when child video is in hidden mode ([#46](https://github.com/kaltura/playkit-js-dual-screen/issues/46)) ([3108788](https://github.com/kaltura/playkit-js-dual-screen/commit/31087880e4cc8265e435610976126cde763e548a))

### [1.7.4](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.7.3...v1.7.4) (2021-11-04)


### Bug Fixes

* **FEV-1130:** add z-index to subtitles on single-view layout ([9483adc](https://github.com/kaltura/playkit-js-dual-screen/commit/9483adca95d9d339816600fea0d081c0aee40f34))

### [1.7.3](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.7.2...v1.7.3) (2021-10-28)


### Bug Fixes

* **FEV-1122:** Slides switching breaks the current layout and changes it back to the default one ([#42](https://github.com/kaltura/playkit-js-dual-screen/issues/42)) ([b1f816c](https://github.com/kaltura/playkit-js-dual-screen/commit/b1f816cc734ee06b734fc1ebadf99445c1662316))

### [1.7.2](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.7.0...v1.7.2) (2021-10-26)


### Bug Fixes

* **FEV-1100:** when seeking more than one slide ahead it, slide loading is noticeable ([#40](https://github.com/kaltura/playkit-js-dual-screen/issues/40)) ([fcfe92c](https://github.com/kaltura/playkit-js-dual-screen/commit/fcfe92c))
* **FEV-1107:** changing layouts via player does not work ([#38](https://github.com/kaltura/playkit-js-dual-screen/issues/38)) ([bf4cf62](https://github.com/kaltura/playkit-js-dual-screen/commit/bf4cf62))
* **FEV-1109:** deleted slides leave black screen ([#39](https://github.com/kaltura/playkit-js-dual-screen/issues/39)) ([aaf32df](https://github.com/kaltura/playkit-js-dual-screen/commit/aaf32df))
* **FEV-1115:** portrait slides are shown landscape ([#41](https://github.com/kaltura/playkit-js-dual-screen/issues/41)) ([6207cd5](https://github.com/kaltura/playkit-js-dual-screen/commit/6207cd5))



## [1.7.0](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.6.2...v1.7.0) (2021-10-12)


### Features

* **FEV-1011:** handle view-change cue-points ([#37](https://github.com/kaltura/playkit-js-dual-screen/issues/37)) ([53e2e57](https://github.com/kaltura/playkit-js-dual-screen/commit/53e2e57))
* **FEV-993:** getting thumb cue points using cue point service ([#36](https://github.com/kaltura/playkit-js-dual-screen/issues/36)) ([dcc8051](https://github.com/kaltura/playkit-js-dual-screen/commit/dcc8051))



### [1.6.2](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.6.1...v1.6.2) (2021-09-20)



### [1.6.1](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.6.0...v1.6.1) (2021-09-20)


### Bug Fixes

* **FEV-1016:** script for QA drop ([#35](https://github.com/kaltura/playkit-js-dual-screen/issues/35)) ([62a6e37](https://github.com/kaltura/playkit-js-dual-screen/commit/62a6e37))



## [1.6.0](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.5.0...v1.6.0) (2021-09-15)


### Bug Fixes

* **FEV-1070:** For entry with one source and uploaded slides the player will show error ([#32](https://github.com/kaltura/playkit-js-dual-screen/issues/32)) ([4b9dc56](https://github.com/kaltura/playkit-js-dual-screen/commit/4b9dc56))


### Features

* **FEV-1016:** CuePoint Manager - Push data to native tracks API ([#33](https://github.com/kaltura/playkit-js-dual-screen/issues/33)) ([a7bd2b1](https://github.com/kaltura/playkit-js-dual-screen/commit/a7bd2b1))
* **FEV-1016:** CuePoint Manager - QA scripts ([#34](https://github.com/kaltura/playkit-js-dual-screen/issues/34)) ([9619a1b](https://github.com/kaltura/playkit-js-dual-screen/commit/9619a1b))
* **FEV-1024:** image-sync-manager and image player unit tests ([#31](https://github.com/kaltura/playkit-js-dual-screen/issues/31)) ([a6df8e4](https://github.com/kaltura/playkit-js-dual-screen/commit/a6df8e4))



## [1.5.0](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.4.0...v1.5.0) (2021-08-18)


### Bug Fixes

* **FEV-1046:** IE11 - Dual-screen plugin's layouts are broken ([#25](https://github.com/kaltura/playkit-js-dual-screen/issues/25)) ([03b4550](https://github.com/kaltura/playkit-js-dual-screen/commit/03b4550))
* **FEV-1065:** resolve ready promise for non-dual medias ([#28](https://github.com/kaltura/playkit-js-dual-screen/issues/28)) ([116e6c1](https://github.com/kaltura/playkit-js-dual-screen/commit/116e6c1))


### Features

* **FEC-11399:** allow ignoring server config ([#29](https://github.com/kaltura/playkit-js-dual-screen/issues/29)) ([f405cb3](https://github.com/kaltura/playkit-js-dual-screen/commit/f405cb3)), closes [kaltura-player-js#480](https://github.com/kaltura/playkit-js-dual-screen/issues/480) [playkit-js-providers#153](https://github.com/kaltura/playkit-js-dual-screen/issues/153)
* **FEV-1020:** [P2] Image player - Create image player component ([#26](https://github.com/kaltura/playkit-js-dual-screen/issues/26)) ([e4572a0](https://github.com/kaltura/playkit-js-dual-screen/commit/e4572a0))



## [1.4.0](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.3.2...v1.4.0) (2021-07-27)


### Bug Fixes

* **FEC-1007:** configuring the default layout to be a single layout of the secondary doesn't work ([#21](https://github.com/kaltura/playkit-js-dual-screen/issues/21)) ([adba57d](https://github.com/kaltura/playkit-js-dual-screen/commit/adba57d))
* **FEV-1005:** side by side inverse ([#23](https://github.com/kaltura/playkit-js-dual-screen/issues/23)) ([ab6e36e](https://github.com/kaltura/playkit-js-dual-screen/commit/ab6e36e))
* **FEV-1006:** primary player wait for secondary player ([#24](https://github.com/kaltura/playkit-js-dual-screen/issues/24)) ([3623547](https://github.com/kaltura/playkit-js-dual-screen/commit/3623547))
* **FEV-962:** responsiveness - handle small size of player ([#20](https://github.com/kaltura/playkit-js-dual-screen/issues/20)) ([726aeb9](https://github.com/kaltura/playkit-js-dual-screen/commit/726aeb9))


### Features

* **FEV-826:** I as a user want to enable captions function in dual-screen plugin ([#22](https://github.com/kaltura/playkit-js-dual-screen/issues/22)) ([7995475](https://github.com/kaltura/playkit-js-dual-screen/commit/7995475))



### [1.3.2](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.3.1...v1.3.2) (2021-07-13)


### Bug Fixes

* **FEV-921:** video sync on pause ([#19](https://github.com/kaltura/playkit-js-dual-screen/issues/19)) ([17a2b69](https://github.com/kaltura/playkit-js-dual-screen/commit/17a2b69))
* **FEV-974:** use draggable target to define draggable area ([#18](https://github.com/kaltura/playkit-js-dual-screen/issues/18)) ([63fb546](https://github.com/kaltura/playkit-js-dual-screen/commit/63fb546))



### [1.3.1](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.3.0...v1.3.1) (2021-07-06)


### Bug Fixes

* **FEC-969:** an error is displayed on the player console ([#17](https://github.com/kaltura/playkit-js-dual-screen/issues/17)) ([c41a68d](https://github.com/kaltura/playkit-js-dual-screen/commit/c41a68d))
* **FEC-970:** changing a dual-screen entry to be Unlisted triggers an error on the player ([#16](https://github.com/kaltura/playkit-js-dual-screen/issues/16)) ([9fc2ce4](https://github.com/kaltura/playkit-js-dual-screen/commit/9fc2ce4))



## [1.3.0](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.2.0...v1.3.0) (2021-07-05)


### Bug Fixes

* **FEC-10835:** update icon component in ui ([#13](https://github.com/kaltura/playkit-js-dual-screen/issues/13)) ([21c6f9b](https://github.com/kaltura/playkit-js-dual-screen/commit/21c6f9b))
* **FEC-922:** mute secondary media ([#15](https://github.com/kaltura/playkit-js-dual-screen/issues/15)) ([477f746](https://github.com/kaltura/playkit-js-dual-screen/commit/477f746))
* **FEV-923:** add tooltips ([#11](https://github.com/kaltura/playkit-js-dual-screen/issues/11)) ([8c6ec14](https://github.com/kaltura/playkit-js-dual-screen/commit/8c6ec14))
* **FEV-926:** reset layout on replay ([#12](https://github.com/kaltura/playkit-js-dual-screen/issues/12)) ([0bf6515](https://github.com/kaltura/playkit-js-dual-screen/commit/0bf6515))
* **FEV-933:** fix "Hide button" location ([#10](https://github.com/kaltura/playkit-js-dual-screen/issues/10)) ([1ef8c0b](https://github.com/kaltura/playkit-js-dual-screen/commit/1ef8c0b))
* **FEV-958:** prevent handle of pointer events for draggable area ([#9](https://github.com/kaltura/playkit-js-dual-screen/issues/9)) ([0c931df](https://github.com/kaltura/playkit-js-dual-screen/commit/0c931df))


### Features

* **FEC-885:** remove settings button from ui ([#14](https://github.com/kaltura/playkit-js-dual-screen/issues/14)) ([9bbb180](https://github.com/kaltura/playkit-js-dual-screen/commit/9bbb180))



## [1.2.0](https://github.com/kaltura/playkit-js-dual-screen/compare/v1.1.0...v1.2.0) (2021-06-14)


### Build System

* add release notes ([7521142](https://github.com/kaltura/playkit-js-dual-screen/commit/7521142))
* fix entry name ([b3f5832](https://github.com/kaltura/playkit-js-dual-screen/commit/b3f5832))
* update main and npmignore ([1af7a1b](https://github.com/kaltura/playkit-js-dual-screen/commit/1af7a1b))
* update node js version ([ed55d64](https://github.com/kaltura/playkit-js-dual-screen/commit/ed55d64))
* **FEC-10700:** add CI/CD ([#4](https://github.com/kaltura/playkit-js-dual-screen/issues/4)) ([87a1995](https://github.com/kaltura/playkit-js-dual-screen/commit/87a1995))


### Features

* **FEV-869:** providers refactor ([#6](https://github.com/kaltura/playkit-js-dual-screen/issues/6)) ([e11aeec](https://github.com/kaltura/playkit-js-dual-screen/commit/e11aeec))
* **FEV-886:** Drag and Snap + Animation ([#8](https://github.com/kaltura/playkit-js-dual-screen/issues/8)) ([e297b72](https://github.com/kaltura/playkit-js-dual-screen/commit/e297b72))



## 1.1.0 (2021-06-03)


### Features

* **FEV-866:** dual screen - initial setup ([407d0c8](https://github.com/kaltura/playkit-js-dual-screen/commit/407d0c8))
* **FEV-883:** fix responsiveness for PIP mode; add types ([2d8d33e](https://github.com/kaltura/playkit-js-dual-screen/commit/2d8d33e))
* **FEV-883:** implement inverse mode ([20298ee](https://github.com/kaltura/playkit-js-dual-screen/commit/20298ee))
* **FEV-883:** Responsiveness ([4c85b8b](https://github.com/kaltura/playkit-js-dual-screen/commit/4c85b8b))
* **FEV-883:** switch to pip from side-by-side ([4d5ab66](https://github.com/kaltura/playkit-js-dual-screen/commit/4d5ab66))
* **FEV-883:** switch to PIP icon ([6c04a2c](https://github.com/kaltura/playkit-js-dual-screen/commit/6c04a2c))
