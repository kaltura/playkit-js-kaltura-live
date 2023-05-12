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
    it('should render currently not broadcasting slate', () => {
      mockKalturaBe('live.json', 'offline-stream.json');
      loadPlayer().then(() => {
        cy.get('[data-testid="kaltura-live_offlineWrapper"]').should('exist');
        cy.get('[data-testid="kaltura-live_offlineSlate"]')
          .should('exist')
          .should('have.text', 'Currently not broadcastingVideo will play once broadcasting starts');
      });
    });
    it('should render live tag', () => {
      mockKalturaBe('live.json', 'live-stream.json');
      loadPlayer().then(() => {
        cy.get('[data-testid="kaltura-live_liveTag"]').should('exist').should('have.text', 'Live');
      });
    });
    if (Cypress.browser.name !== 'webkit') {
      it('should render error slate', () => {
        mockKalturaBe('live.json', null);
        loadPlayer().then(() => {
          cy.get('[data-testid="kaltura-live_offlineWrapper"]').should('exist');
          cy.get('[data-testid="kaltura-live_offlineSlate"]').should('exist').should('have.text', 'Something went wrongTry refreshing the page');
        });
      });
    }
  });
});
