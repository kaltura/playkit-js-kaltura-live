// @ts-ignore
import {core} from '@playkit-js/kaltura-player-js';
import {mockKalturaBe, loadPlayer, MANIFEST, MANIFEST_SAFARI} from './env';

const {EventType, FakeEvent, Error} = core;

describe('Kaltura-live plugin', () => {
  beforeEach(() => {
    // manifest
    cy.intercept('GET', '**/a.m3u8*', Cypress.browser.name === 'webkit' ? MANIFEST_SAFARI : MANIFEST);
    // thumbnails
    cy.intercept('GET', '**/width/164/vid_slices/100', {fixture: '100.jpeg'});
    cy.intercept('GET', '**/height/360/width/640', {fixture: '640.jpeg'});
    // kava
    cy.intercept('GET', '**/index.php?service=analytics*', {});
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
    it('should render post-playback slate', () => {
      mockKalturaBe('live.json', 'live-stream.json');
      loadPlayer().then(kalturaPlayer => {
        kalturaPlayer.currentTime = 60;
        cy.get('.kaltura-live-title').should('have.text', 'Broadcast is no longer live');
        kalturaPlayer.dispatchEvent(new FakeEvent(EventType.ENDED));
      });
    });
    it('should render entry poster as offline slate background', () => {
      mockKalturaBe('live.json', 'offline-stream.json');
      loadPlayer().then(kalturaPlayer => {
        cy.get('[data-testid="kaltura-live_offlineWrapper"]').should('have.attr', 'style', `background-image: url("${kalturaPlayer.poster}");`);
      });
    });
    it('should render custom image url as offline slate background', () => {
      mockKalturaBe('live.json', 'offline-stream.json');
      loadPlayer({offlineSlateUrl: 'http://test'}).then(() => {
        cy.get('[data-testid="kaltura-live_offlineWrapper"]').should('have.attr', 'style', `background-image: url("http://test");`);
      });
    });
    it('should render offline slate without text message', () => {
      mockKalturaBe('live.json', 'offline-stream.json');
      loadPlayer({offlineSlateWithoutText: true}).then(() => {
        cy.get('[data-testid="kaltura-live_offlineWrapper"]')
          .should('exist')
          .then(() => {
            cy.get('.kaltura-live-title').should('not.exist');
            cy.get('.kaltura-live-description').should('not.exist');
          });
      });
    });
    if (Cypress.browser.name !== 'webkit') {
      // TODO: update test once kaltura-player got updated
      it.skip('should render error slate', () => {
        mockKalturaBe('live.json', null);
        loadPlayer().then(() => {
          cy.get('[data-testid="kaltura-live_offlineWrapper"]').should('exist');
          cy.get('[data-testid="kaltura-live_offlineSlate"]').should('exist').should('have.text', 'Something went wrongTry refreshing the page');
        });
      });
    }
  });
});
