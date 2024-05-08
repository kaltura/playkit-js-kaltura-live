// @ts-ignore
import {core} from '@playkit-js/kaltura-player-js';
import {mockKalturaBe, loadPlayer, MANIFEST, MANIFEST_SAFARI, getPlayer} from './env';

const {EventType, FakeEvent, Error} = core;

Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

describe('Kaltura-live plugin', () => {
  beforeEach(() => {
    // manifest
    cy.intercept('GET', '**/a.m3u8*', Cypress.browser.name === 'webkit' ? MANIFEST_SAFARI : MANIFEST);
    // thumbnails
    cy.intercept('GET', '**/width/164/vid_slices/100', {fixture: '100.jpeg'});
    cy.intercept('GET', '**/height/360/width/640', {fixture: '640.jpeg'});
    // kava
    cy.intercept('POST', '**/index.php?service=analytics*', {});
  });

  describe('kaltura-live slates', () => {
    it('should not render slates for VOD media', () => {
      mockKalturaBe('vod.json', null);
      loadPlayer().then(() => {
        cy.get('[data-testid="kaltura-live_liveTag"]').should('not.exist');
        cy.get('[data-testid="kaltura-live_offlineWrapper"]').should('exist');
        cy.get('[data-testid="kaltura-live_noLongerLiveSlate"]').should('not.exist');
        cy.get('[data-testid="kaltura-live_offlineSlate"]').should('not.exist');
      });
    });
    it('should render pre-playback slate', () => {
      mockKalturaBe('live.json', 'offline-stream.json');
      loadPlayer().then(() => {
        cy.get('[data-testid="kaltura-live_offlineWrapper"]').should('exist');
        cy.get('[data-testid="kaltura-live_offlineSlate"]').should('exist');
        cy.get('.kaltura-live-title').should('have.text', 'Not broadcasting yet');
        cy.get('.kaltura-live-description').should('have.text', 'Video will play once broadcasting starts');
      });
    });
    it('should render live tag', () => {
      mockKalturaBe('live.json', 'live-stream.json');
      loadPlayer().then(() => {
        cy.get('[data-testid="kaltura-live_liveTag"]').should('exist').should('have.text', 'Live');
      });
    });
    it('should add preview classname to seekbar', () => {
      mockKalturaBe('live.json', 'preview-stream.json');
      loadPlayer({checkLiveWithKs: true}).then(() => {
        cy.get('.playkit-seek-bar.live-priview').should('exist');
      });
    });
    it('should render post-playback slate', () => {
      mockKalturaBe('live.json', 'live-stream.json');
      loadPlayer({}, {autoplay: true}).then(kalturaPlayer => {
        cy.get('[data-testid="kaltura-live_liveTag"]').then(() => {
          kalturaPlayer.currentTime = 60;
          cy.get('.kaltura-live-title').should('have.text', 'Broadcast is no longer live');
        });
      });
    });
    it('should render entry poster as offline slate background', () => {
      mockKalturaBe('live.json', 'offline-stream.json');
      loadPlayer().then(kalturaPlayer => {
        cy.get('[data-testid="kaltura-live_offlineImage"]').should('have.attr', 'src', kalturaPlayer.poster);
      });
    });
    it('should render custom image url as pre-broadcast slate background', () => {
      mockKalturaBe('live.json', 'offline-stream.json');
      loadPlayer({preOfflineSlateUrl: 'https://test/custom-slate'}).then(() => {
        cy.get('[data-testid="kaltura-live_offlineImage"]').should('have.attr', 'src', 'https://test/custom-slate');
      });
    });
    it('should render custom image url as post-broadcast slate background', () => {
      mockKalturaBe('live.json', 'live-stream.json');
      loadPlayer({postOfflineSlateUrl: 'https://test/custom-slate'}, {autoplay: true}).then(kalturaPlayer => {
        cy.get('[data-testid="kaltura-live_liveTag"]').then(() => {
          kalturaPlayer.currentTime = 60;
          cy.get('[data-testid="kaltura-live_offlineImage"]').should('have.attr', 'src', 'https://test/custom-slate');
        });
      });
    });
    it('should render entry poster if custom image url invalid', () => {
      mockKalturaBe('live.json', 'offline-stream.json');
      loadPlayer({preOfflineSlateUrl: 'https://invalidUrl'}).then(kalturaPlayer => {
        cy.get('[data-testid="kaltura-live_offlineImage"]').should('have.attr', 'src', kalturaPlayer.poster);
      });
    });
    it('should render offline slate without text message', () => {
      mockKalturaBe('live.json', 'offline-stream.json');
      loadPlayer({offlineSlateWithoutText: true}).then(() => {
        cy.get('[data-testid="kaltura-live_offlineWrapper"]')
          .should('exist')
          .then(() => {
            cy.get('[data-testid="kaltura-live_offlineImage"]').should('exist');
            cy.get('.kaltura-live-title').should('not.exist');
            cy.get('.kaltura-live-description').should('not.exist');
          });
      });
    });
    it('should render error slate', () => {
      mockKalturaBe('live.json', 'live-stream.json');
      loadPlayer().then(kalturaPlayer => {
        const error = new Error(Error.Severity.CRITICAL, Error.Category.PLAYER, Error.Code.VIDEO_ERROR, {});
        kalturaPlayer.dispatchEvent(new FakeEvent(EventType.ERROR, error));
        cy.get('.playkit-error-overlay').should('exist');
      });
    });
    it('should render player as pre-broadcast slate background', () => {
      mockKalturaBe('live.json', 'offline-stream.json');
      loadPlayer({preOfflineEntryId: '0_wifqaipd'}).then(() => {
        cy.get('#pre-broadcast-player-placeholder').should('exist');
        cy.get('#post-broadcast-player-placeholder').should('not.exist');
        cy.get('[data-testid="kaltura-live_videoContainer"]').should('exist');
        cy.get('[data-testid="kaltura-live_offlineImage"]').should('not.exist');
      });
    });
    it('should remove pre and post broadcast players', () => {
      mockKalturaBe('live.json', 'offline-stream.json');
      loadPlayer({preOfflineEntryId: '0_wifqaipd', postOfflineEntryId: '0_wifqaipd'}).then(kalturaPlayer => {
        cy.get('#pre-broadcast-player-placeholder').should('exist');
        cy.get('#post-broadcast-player-placeholder')
          .should('exist')
          .then(() => {
            kalturaPlayer.destroy();
            cy.get('#pre-broadcast-player-placeholder').should('not.exist');
            cy.get('#post-broadcast-player-placeholder').should('not.exist');
          });
      });
    });
    it('should render custom image url as post-broadcast slate background', () => {
      mockKalturaBe('live.json', 'live-stream.json');
      loadPlayer({postOfflineEntryId: '0_wifqaipd'}, {autoplay: true}).then(kalturaPlayer => {
        cy.get('#pre-broadcast-player-placeholder').should('not.exist');
        cy.get('#post-broadcast-player-placeholder').should('exist');
        kalturaPlayer.currentTime = 60;
        cy.get('[data-testid="kaltura-live_videoContainer"]').should('exist');
        cy.get('[data-testid="kaltura-live_offlineImage"]').should('not.exist');
      });
    });
    it('should test mute button on pre-broadcast slate background', () => {
      mockKalturaBe('live.json', 'offline-stream.json');
      loadPlayer({preOfflineEntryId: '0_wifqaipd'}, {muted: false}).then(kalturaPlayer => {
        expect(kalturaPlayer.muted).to.be.false;
        cy.get('[data-testid="kaltura-live_mute-button"]').should('have.text', 'Mute');
        getPlayer('pre-broadcast-player-placeholder').then(preBroadcastPlayer => {
          expect(preBroadcastPlayer.muted).to.be.false;
        });
        cy.get('[data-testid="kaltura-live_mute-button"]').click({force: true});
        cy.get('[data-testid="kaltura-live_mute-button"]')
          .should('have.text', 'Unmute')
          .then(() => {
            expect(kalturaPlayer.muted).to.be.true;
          });
        getPlayer('pre-broadcast-player-placeholder').then(preBroadcastPlayer => {
          expect(preBroadcastPlayer.muted).to.be.true;
        });
      });
    });
    it('should test mute button on post-broadcast slate background', () => {
      mockKalturaBe('live.json', 'live-stream.json');
      loadPlayer({postOfflineEntryId: '0_wifqaipd'}, {autoplay: true, muted: false}).then(kalturaPlayer => {
        cy.get('[data-testid="kaltura-live_liveTag"]').then(() => {
          kalturaPlayer.currentTime = 60;
          expect(kalturaPlayer.muted).to.be.false;
          cy.get('[data-testid="kaltura-live_mute-button"]').should('have.text', 'Mute');
          getPlayer('post-broadcast-player-placeholder').then(preBroadcastPlayer => {
            expect(preBroadcastPlayer.muted).to.be.false;
          });
          cy.get('[data-testid="kaltura-live_mute-button"]').click({force: true});
          cy.get('[data-testid="kaltura-live_mute-button"]')
            .should('have.text', 'Unmute')
            .then(() => {
              expect(kalturaPlayer.muted).to.be.true;
            });
          getPlayer('post-broadcast-player-placeholder').then(preBroadcastPlayer => {
            expect(preBroadcastPlayer.muted).to.be.true;
          });
        });
      });
    });
  });

  describe('kaltura-live live viewers', () => {
    it('should not render liveViewers component for VOD media', () => {
      mockKalturaBe('vod.json', null);
      loadPlayer({showLiveViewers: true}).then(() => {
        cy.get('[data-testid="kaltura-live_liveViewers"]').should('not.exist');
      });
    });
    it('should not render liveViewers component when disabled', () => {
      mockKalturaBe('live.json', 'live-stream.json');
      loadPlayer({showLiveViewers: false}, {autoplay: true}).then(() => {
        cy.get('[data-testid="kaltura-live_liveViewers"]').should('not.exist');
      });
    });
    it('should render liveViewers component', () => {
      mockKalturaBe('live.json', 'live-stream.json');
      loadPlayer({showLiveViewers: true}).then(() => {
        cy.get('[data-testid="kaltura-live_liveViewers"]').should('exist');
        cy.get('[data-testid="kaltura-live_liveViewersNumber"]').should('exist').should('have.text', '0');
        cy.get('[data-testid="kaltura-live_liveViewersNumber"]').should('have.text', '3,124');
      });
    });
  });
});
