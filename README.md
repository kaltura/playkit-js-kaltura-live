# PlayKit JS Kaltura-live - plugin for the [PlayKit JS Player]

[![Build Status](https://github.com/kaltura/playkit-js-kaltura-live/actions/workflows/run_canary_full_flow.yaml/badge.svg)](https://github.com/kaltura/playkit-js-kaltura-live/actions/workflows/run_canary_full_flow.yaml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![](https://img.shields.io/npm/v/@playkit-js/playkit-js-kaltura-live/latest.svg)](https://www.npmjs.com/package/@playkit-js/playkit-js-kaltura-live)
[![](https://img.shields.io/npm/v/@playkit-js/playkit-js-kaltura-live/canary.svg)](https://www.npmjs.com/package/@playkit-js/playkit-js-kaltura-live/v/canary)

PlayKit JS Kaltura-live is written in [ECMAScript6], statically analysed using [Typescript] and transpiled in ECMAScript5 using [Babel].

[typescript]: https://www.typescriptlang.org/
[ecmascript6]: https://github.com/ericdouglas/ES6-Learning#articles--tutorials
[babel]: https://babeljs.io

## Getting Started

### Prerequisites

The plugin requires [Kaltura Player] to be loaded first.

[kaltura player]: https://github.com/kaltura/kaltura-player-js

### Installing

First, clone and run [yarn] to install dependencies:

[yarn]: https://yarnpkg.com/lang/en/

```
git clone https://github.com/kaltura/playkit-js-kaltura-live.git
cd playkit-js-kaltura-live
yarn install
```

### Building

Then, build the player

```javascript
yarn run build
```

### Embed the library in your test page

Finally, add the bundle as a script tag in your page, and initialize the player

```html
<script type="text/javascript" src="/PATH/TO/FILE/kaltura-player.js"></script>
<!--Kaltura player-->
<script type="text/javascript" src="/PATH/TO/FILE/playkit-kaltura-live.js"></script>
<!--PlayKit Kaltura-live plugin-->
<div id="player-placeholder" style="height:360px; width:640px">
  <script type="text/javascript">
    var playerContainer = document.querySelector("#player-placeholder");
    var config = {
     ...
     targetId: 'player-placeholder',
     plugins: {
      "kaltura-live": { ... },
     }
     ...
    };
    var player = KalturaPlayer.setup(config);
    player.loadMedia(...);
  </script>
</div>
```

## Documentation

Kaltura-live plugin configuration can been found here:

- **[Configuration](#configuration)**

### And coding style tests

We use ESLint [recommended set](http://eslint.org/docs/rules/) with some additions for enforcing [Flow] types and other rules.

See [ESLint config](.eslintrc.json) for full configuration.

We also use [.editorconfig](.editorconfig) to maintain consistent coding styles and settings, please make sure you comply with the styling.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/kaltura/playkit-js-kaltura-live/tags).

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details

## Commands

Run dev server: `yarn dev`;<br/>
Bump version: `yarn release`;<br/>

<a name="configuration"></a>
## Configuration

#### Configuration Structure

```js
//Default configuration
"kaltura-live" = {};
//Plugin params
"kaltura-live" = {
    checkLiveWithKs: boolean,
    isLiveInterval: number,
}
```

##

> ### config.checkLiveWithKs
>
> ##### Type: `boolean`
>
> ##### Default: `false`
>

##

> ### config.forceChaptersThumb
>
> ##### Type: `number`
>
> ##### Default: `10`
>

### Dev env
Node version: up to 14+<br/>
If nvm installed: `nvm use` change version of current terminal to required.<br/>
