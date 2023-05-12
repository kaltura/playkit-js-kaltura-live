export const MANIFEST = `#EXTM3U
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",LANGUAGE="en",NAME="English",AUTOSELECT=YES,DEFAULT=YES,URI="${location.origin}/media/index_1.m3u8",SUBTITLES="subs"
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=509496,RESOLUTION=480x272,AUDIO="audio",SUBTITLES="subs"
${location.origin}/media/index.m3u8`;

export const MANIFEST_SAFARI = `#EXTM3U
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",DEFAULT=NO,AUTOSELECT=YES,FORCED=NO,LANGUAGE="en",URI="${location.origin}/media/index_1.m3u8"
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=504265,RESOLUTION=480x272,AUDIO="audio",SUBTITLES="subs"
${location.origin}/media/index.m3u8`;

export const getPlayer = (id = 'player-placeholder') => {
  // @ts-ignore
  return cy.window().then($win => $win.KalturaPlayer.getPlayers()[id]);
};

export const preparePage = (puginConf = {}, playbackConf = {}) => {
  cy.visit('index.html');
  return cy.window().then(win => {
    try {
      // @ts-ignore
      var kalturaPlayer = win.KalturaPlayer.setup({
        targetId: 'player-placeholder',
        provider: {
          partnerId: -1,
          env: {
            cdnUrl: 'http://mock-cdn',
            serviceUrl: 'http://mock-api'
          }
        },
        plugins: {
          'kaltura-live': puginConf
        },
        playback: {muted: true, autoplay: true, ...playbackConf}
      });
      return kalturaPlayer.loadMedia({entryId: '0_wifqaipd'});
    } catch (e: any) {
      return Promise.reject(e.message);
    }
  });
};

const checkRequest = (reqBody: any, service: string, action: string) => {
  return reqBody?.service === service && reqBody?.action === action;
};

export const loadPlayer = (puginConf = {}, playbackConf: Record<string, any> = {}) => {
  return preparePage(puginConf, playbackConf).then(() =>
    getPlayer().then(kalturaPlayer => {
      if (playbackConf.autoplay) {
        return kalturaPlayer.ready().then(() => kalturaPlayer);
      }
      return kalturaPlayer;
    })
  );
};

export const mockKalturaBe = (baseEntryFixture: string, streamStateFixture: string | null, secondStreamStateFixture?: string | null) => {
  let counter = 0;
  cy.intercept('http://mock-api/service/multirequest', req => {
    if (checkRequest(req.body[2], 'baseEntry', 'list')) {
      return req.reply({fixture: baseEntryFixture});
    }
    if (checkRequest(req.body[2], 'livestream', 'getDetails')) {
      counter++;
      if (streamStateFixture === null) {
        return req.destroy();
      }
      if (secondStreamStateFixture !== undefined && counter > 1) {
        if (secondStreamStateFixture === null) {
          return req.destroy();
        } else {
          return req.reply({fixture: secondStreamStateFixture});
        }
      }
      return req.reply({fixture: streamStateFixture});
    }
  });
  cy.intercept('GET', '**/ks/123', {fixture: 'thumb-asset.jpeg'}).as('getSlides');
};
