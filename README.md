# Kaltura Player V7 - Kaltura-live plugin

## Overview
> this section will be added soon

## Project structure
> this section will be added soon

## Commands

### Serve test pages

This command will serve test page with your local plugin. It will watch for changes and build them automatically. 

```$xslt
npm run serve  // served on http://localhost:8007
``` 

#### Serve command pre-requisite
Until the cli library will be ready, you will need to manually create the test page, using the following guide:
1. open folder `test` and copy file `test/index.template.ejs` as  `test/index.ejs`
2. open `index.ejs` file and fill all places marked with `TODO` comment.

### Build packages 
This command will build the plugin create dist folder with relevant assets 

```$xslt
npm run build // dist folder will be created under `dist`
``` 

### Analyze packages bundle
This command will build and create a static page visualizing the bundle content.

```$xslt
npm run analyze  // for plugin v7 bundle analyze to be shown automatically in the browser
``` 

### Update Player Contrib libraries
This command will update packages to use `latest` or `next` version of the player contrib libraries.

```$xslt
npm run contrib:latest // upgrade contrib libraries to latest version
npm run contrib:next // upgrade contrib libraries to next version
```
