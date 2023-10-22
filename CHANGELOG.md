# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### 3.2.5 (2023-10-22)

### 3.2.4 (2023-08-15)


### Bug Fixes

* **FEC-13300:** fix translates for post-broadcast slate ([#390](https://github.com/kaltura/playkit-js-kaltura-live/issues/390)) ([845e73e](https://github.com/kaltura/playkit-js-kaltura-live/commit/845e73edc71a375a6334145cf04876307f938d6e))

### 3.2.3 (2023-06-27)


### Bug Fixes

* **FEC-13123:** replace travis with github actions ([96bb31c](https://github.com/kaltura/playkit-js-kaltura-live/commit/96bb31c73c4e25e75b87640658900db777bb3efe))

### [3.2.2](https://github.com/kaltura/playkit-js-kaltura-live/compare/v3.2.1...v3.2.2) (2023-05-17)


### Bug Fixes

* **FEC-13145:** upgrade dependancies for common and ui-managers etc ([#384](https://github.com/kaltura/playkit-js-kaltura-live/issues/384)) ([917ed67](https://github.com/kaltura/playkit-js-kaltura-live/commit/917ed67a35c0487137fe006f54fccfefc2a5d4fd))

### [3.2.1](https://github.com/kaltura/playkit-js-kaltura-live/compare/v3.2.0...v3.2.1) (2023-02-23)

## [3.2.0](https://github.com/kaltura/playkit-js-kaltura-live/compare/v3.1.1...v3.2.0) (2023-01-19)


### Features

* **fix-1574:** migrate style of plugin live ([#374](https://github.com/kaltura/playkit-js-kaltura-live/issues/374)) ([b89d22a](https://github.com/kaltura/playkit-js-kaltura-live/commit/b89d22a4836e6f9db365b6056edf8c1199234e15))

### [3.1.1](https://github.com/kaltura/playkit-js-kaltura-live/compare/v3.1.0...v3.1.1) (2022-12-13)


### Bug Fixes

* **FEV-1205:** change Kaltura-player network configuration (endlist, manifest) ([#370](https://github.com/kaltura/playkit-js-kaltura-live/issues/370)) ([260b260](https://github.com/kaltura/playkit-js-kaltura-live/commit/260b2606e41613f95c939630992bf8a834c96b87))
* **FEV-1546:** Translation in live plugin ([#369](https://github.com/kaltura/playkit-js-kaltura-live/issues/369)) ([1dd5d8b](https://github.com/kaltura/playkit-js-kaltura-live/commit/1dd5d8ba5093bdeac739a3050e55bc1f70db1eb8))
* **FEV-1546:** Translation in live plugin ([#376](https://github.com/kaltura/playkit-js-kaltura-live/issues/376)) ([d06e20a](https://github.com/kaltura/playkit-js-kaltura-live/commit/d06e20aa78cc682580610c894b489cacaf311944))
* **FEV-1593:** live screens content is not being read by screen readers ([#375](https://github.com/kaltura/playkit-js-kaltura-live/issues/375)) ([772acce](https://github.com/kaltura/playkit-js-kaltura-live/commit/772acce9eb1ad45484174f15b19b5671757f2f89))
* **FEV-1601:** When a live stream with DVR OFF is stopped there is a spinner on top of the slate ([#377](https://github.com/kaltura/playkit-js-kaltura-live/issues/377)) ([bba1176](https://github.com/kaltura/playkit-js-kaltura-live/commit/bba117613fd72f85f55ce93e7106f7eda689dba8))

## [3.1.0](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.2.5...v3.1.0) (2022-10-26)


### Features

* **FEV-1450:** added A11yWrapper for live-tag button for keyboard events ([4c7bfa1](https://github.com/kaltura/playkit-js-kaltura-live/commit/4c7bfa1d7919ca01e94aff3034eff60d6f2083c2))
* **FEV-1450:** aria label added for button ([7692be7](https://github.com/kaltura/playkit-js-kaltura-live/commit/7692be747d8c48f400312351a81ab25931316d6f))


### Bug Fixes

* **FEC-12493:** verify ended event is propagated to the player only in case when both primary and secondary streams are stopped ([#360](https://github.com/kaltura/playkit-js-kaltura-live/issues/360)) ([abaa98e](https://github.com/kaltura/playkit-js-kaltura-live/commit/abaa98e11ccf64d6178e48b54ebb20a3c82e74a8))
* **Fev 1278 :** If the playlist contains a live entry that is not broadcasting the currently not broadcasting tile will overlap the entire player ([#357](https://github.com/kaltura/playkit-js-kaltura-live/issues/357)) ([99a4047](https://github.com/kaltura/playkit-js-kaltura-live/commit/99a4047d3abdf2069d5747156b6b9f7fd7850712))
* **FEV-1325:** revert main changes for FEV-1278 ([#359](https://github.com/kaltura/playkit-js-kaltura-live/issues/359)) ([13d2427](https://github.com/kaltura/playkit-js-kaltura-live/commit/13d24277b9f97cfc379acd6700d7392be15973c5))
* **FEV-1325:** revert style changes for FEV-1278 ([#363](https://github.com/kaltura/playkit-js-kaltura-live/issues/363)) ([f9720a8](https://github.com/kaltura/playkit-js-kaltura-live/commit/f9720a80e9c234975b9175524abca4a2984eae86))
* **FEV-1403:** proper handle end event for simulive entry ([#366](https://github.com/kaltura/playkit-js-kaltura-live/issues/366)) ([987f080](https://github.com/kaltura/playkit-js-kaltura-live/commit/987f0800cdc115ae4637c61085cbbfbf55224ec7))
* **FEV-1419:** deactivate all plugins when offline slate is shown ([#365](https://github.com/kaltura/playkit-js-kaltura-live/issues/365)) ([caafb98](https://github.com/kaltura/playkit-js-kaltura-live/commit/caafb982e3292786205cd2dea03af38cf14b69bc))

### [2.2.5](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.2.4...v2.2.5) (2022-04-11)


### Bug Fixes

* **FEV-1199:** set player configuration in loadMedia hook ([#355](https://github.com/kaltura/playkit-js-kaltura-live/issues/355)) ([f21cc97](https://github.com/kaltura/playkit-js-kaltura-live/commit/f21cc97d2a8c80237ed3ed4a6ad43d2d6a8c1f31))

### [2.2.4](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.2.3...v2.2.4) (2022-03-30)


### Bug Fixes

* **FEV-1199:** set player configuration only once player got ready ([#353](https://github.com/kaltura/playkit-js-kaltura-live/issues/353)) ([efa5f53](https://github.com/kaltura/playkit-js-kaltura-live/commit/efa5f53ca3a1a3fb95b8d2a2f09e4f0ba2d483b0))

### [2.2.3](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.2.2...v2.2.3) (2022-03-02)


### Bug Fixes

* **LIV-905:** fix mpeg-dash restart issues ([#350](https://github.com/kaltura/playkit-js-kaltura-live/issues/350)) ([d32a747](https://github.com/kaltura/playkit-js-kaltura-live/commit/d32a747a81adddf2f2ae154360109a5509eeda81)), closes [/github.com/google/shaka-player/issues/555#issuecomment-294552711](https://github.com/kaltura//github.com/google/shaka-player/issues/555/issues/issuecomment-294552711)

### [2.2.2](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.2.1...v2.2.2) (2022-02-06)
### Features

* **LIV-758:** I as Admin want to scheduled a live broadcast to start after the simulive content ends ([#344](https://github.com/kaltura/playkit-js-kaltura-live/issues/344)) ([d487e30](https://github.com/kaltura/playkit-js-kaltura-live/pull/344/commits/924352a7dace1f617d7de6e5a579e84cb2d8294d))

### [2.2.1](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.2.0...v2.2.1) (2021-11-28)

## [2.2.0](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.1.8...v2.2.0) (2021-11-23)


### Features

* **FEV-1140:** remove contrib dependency ([#338](https://github.com/kaltura/playkit-js-kaltura-live/issues/338)) ([6641e14](https://github.com/kaltura/playkit-js-kaltura-live/commit/6641e14eb5e889800a97ce945878b3242e122824))


### Bug Fixes

* **FEV-1103:** live indicator updates; upd dependencies ([#340](https://github.com/kaltura/playkit-js-kaltura-live/issues/340)) ([d18b8a9](https://github.com/kaltura/playkit-js-kaltura-live/commit/d18b8a963d3b2961c43a44a1d5948d00c727337d))
* **FEV-1135:** configure player in plugin to reduce fallback time ([#341](https://github.com/kaltura/playkit-js-kaltura-live/issues/341)) ([846ae31](https://github.com/kaltura/playkit-js-kaltura-live/commit/846ae318d3acadd7e64f5237070ba9361c0ec06d))
* **FEV-1135:** offline slate doesn't appears for live media with DVR ([#337](https://github.com/kaltura/playkit-js-kaltura-live/issues/337)) ([73707dd](https://github.com/kaltura/playkit-js-kaltura-live/commit/73707ddad59bdcb463cdfc26b0b4ecd86de41ffc))
* **FEV-1144:** fix parse of ID3 tag ([#339](https://github.com/kaltura/playkit-js-kaltura-live/issues/339)) ([403550e](https://github.com/kaltura/playkit-js-kaltura-live/commit/403550e9ea0a6c62809ea3001e1bc14ea14666f9))

### [2.1.8](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.1.7...v2.1.8) (2021-11-02)


### Bug Fixes

* **FEV-1126:** for live entries without DVR display slate without END event ([#335](https://github.com/kaltura/playkit-js-kaltura-live/issues/335)) ([3b98450](https://github.com/kaltura/playkit-js-kaltura-live/commit/3b984509787e184c85602b6ad7aedcff263b91cc))
* **FEV-1128:** prevent get details call for non-live entry ([#336](https://github.com/kaltura/playkit-js-kaltura-live/issues/336)) ([93db24c](https://github.com/kaltura/playkit-js-kaltura-live/commit/93db24c181dd434af7a105c75f05ee284e5b3a13))

### [2.1.7](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.1.6...v2.1.7) (2021-11-01)

### [2.1.6](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.1.5...v2.1.6) (2021-10-25)

### [2.1.5](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.1.4...v2.1.5) (2021-10-21)


### Bug Fixes

* **FEV-1081:** handle 'end' event on switches from primary\secondary ([#334](https://github.com/kaltura/playkit-js-kaltura-live/issues/334)) ([1de4154](https://github.com/kaltura/playkit-js-kaltura-live/commit/1de4154033cbc341c995d8a5ac56c1f51f2f8241))

### [2.1.4](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.1.3...v2.1.4) (2021-03-24)

### [2.1.3](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.1.2...v2.1.3) (2021-03-10)

### [2.1.2](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.1.1...v2.1.2) (2021-02-24)

### [2.1.1](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.1.0...v2.1.1) (2021-02-05)


### Bug Fixes

* update live-tag on pause (FEV-788) ([#230](https://github.com/kaltura/playkit-js-kaltura-live/issues/230)) ([66b1ab3](https://github.com/kaltura/playkit-js-kaltura-live/commit/66b1ab36da22639a214ac9970390cdda6315b956))
* **FEV-654:** set "No longer live" slate only when playback end ([#232](https://github.com/kaltura/playkit-js-kaltura-live/issues/232)) ([283b0b1](https://github.com/kaltura/playkit-js-kaltura-live/commit/283b0b149bc76a4b1dbb1f08d133c3d4e8b12f6b))
* **FEV-758:** Player v7 | Live 2.0.7| - Entry view - While the stream is in preview an error will be shown in the player ([#231](https://github.com/kaltura/playkit-js-kaltura-live/issues/231)) ([a88cb92](https://github.com/kaltura/playkit-js-kaltura-live/commit/a88cb92ec2f8b4d85b6965f681c738ae0ced60b8))
* **FEV-777:** use core api to render live-tag, refactored live-tag to avoid re-render ([#234](https://github.com/kaltura/playkit-js-kaltura-live/issues/234)) ([2b512e2](https://github.com/kaltura/playkit-js-kaltura-live/commit/2b512e2d4c16724a20a662fe66bcf5834f30b18e))

### [2.1.0](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.0.7...v2.1.0) (2021-01-04)

### [2.0.7](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.0.6...v2.0.7) (2020-08-31)

### [2.0.6](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.0.5...v2.0.6) (2020-08-18)

### [2.0.5](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.0.4...v2.0.5) (2020-07-29)

### [2.0.4](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.0.3...v2.0.4) (2020-06-23)

### [2.0.3](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.0.2...v2.0.3) (2020-06-09)

### [2.0.2](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.0.1...v2.0.2) (2020-05-28)

### [2.0.1](https://github.com/kaltura/playkit-js-kaltura-live/compare/v2.0.0...v2.0.1) (2020-05-27)

### [1.0.11](https://github.com/kaltura/playkit-js-kaltura-live/compare/v1.0.10...v2.0.0) (2020-05-04)

### [1.0.10](https://github.com/kaltura/playkit-js-kaltura-live/compare/v1.0.9...v1.0.10) (2020-04-19)

### [1.0.9](https://github.com/kaltura/playkit-js-kaltura-live/compare/v1.0.8...v1.0.9) (2020-04-16)


### Bug Fixes

* FEV-454 missing attribute in analytics ([#66](https://github.com/kaltura/playkit-js-kaltura-live/issues/66)) ([9737b31](https://github.com/kaltura/playkit-js-kaltura-live/commit/9737b311bc4e6b35b98b27e3f173fdd421d43087))

### [1.0.8](https://github.com/kaltura/playkit-js-kaltura-live/compare/v1.0.7...v1.0.8) (2019-12-09)


### Bug Fixes

* FEV-438 - wrong dispatcher function ([#37](https://github.com/kaltura/playkit-js-kaltura-live/issues/37)) ([25dec53](https://github.com/kaltura/playkit-js-kaltura-live/commit/25dec5337b2e30cf7c6b94de010450dddb572af7))

### [1.0.7](https://github.com/kaltura/playkit-js-kaltura-live/compare/v1.0.6...v1.0.7) (2019-12-08)


### Bug Fixes

* FEV-427 - improve errors message ([#33](https://github.com/kaltura/playkit-js-kaltura-live/issues/33)) ([3ca1e27](https://github.com/kaltura/playkit-js-kaltura-live/commit/3ca1e2728e30a1a33bed268f7ee333504d15ed2f))
* FEV-428 - IE11 win7 is not able to reset the engine ([#34](https://github.com/kaltura/playkit-js-kaltura-live/issues/34)) ([a357c4a](https://github.com/kaltura/playkit-js-kaltura-live/commit/a357c4a487465936e48b82135760cbfa9b6e918e))

### [1.0.6](https://github.com/kaltura/playkit-js-kaltura-live/compare/v1.0.5...v1.0.6) (2019-12-04)

### [1.0.5](https://github.com/kaltura/playkit-js-kaltura-live/compare/v1.0.4...v1.0.5) (2019-11-28)

### [1.0.4](https://github.com/kaltura/playkit-js-kaltura-live/compare/v1.0.3...v1.0.4) (2019-11-25)

### [1.0.3](https://github.com/kaltura/playkit-js-kaltura-live/compare/v1.0.2...v1.0.3) (2019-11-17)

### [1.0.2](https://github.com/kaltura/playkit-js-kaltura-live/compare/v1.0.1...v1.0.2) (2019-11-14)


### Bug Fixes

* multiple adding slates ([74e00d0](https://github.com/kaltura/playkit-js-kaltura-live/commit/74e00d07e1a8efde46c5c66478ceb29bec071232))

### [1.0.1](https://github.com/kaltura/playkit-js-kaltura-live/compare/v1.0.0...v1.0.1) (2019-11-13)

### [1.0.0](https://github.com/kaltura/playkit-js-kaltura-live/compare/v0.0.1...v1.0.0) (2019-11-13)


### Features

* 
