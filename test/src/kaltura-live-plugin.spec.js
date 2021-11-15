import {setup, core} from 'kaltura-player-js';
import * as TestUtils from './utils/test-utils';

describe('Kaltura Live plugin', function () {
  let player, sandbox;
  const target = 'player-placeholder';
  const sources = {
    progressive: [
      {
        mimetype: 'video/mp4',
        url: 'https://www.w3schools.com/tags/movie.mp4',
        id: '1_rwbj3j0a_11311,applehttp'
      }
    ]
  };

  before(() => {
    TestUtils.createElement('DIV', target);
    const el = document.getElementById(target);
    el.style.height = '360px';
    el.style.width = '640px';
  });
  afterEach(() => {
    sandbox.restore();
    player.destroy();
    player = null;
    TestUtils.removeVideoElementsFromTestPage();
  });
  after(() => {
    TestUtils.removeElement(target);
  });
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    player = setup({
      targetId: target,
      provider: {},
      plugins: {
        kalturaCuepoints: {}
      }
    });
  });

  describe('Kaltura live-pluign', () => {
    it('tests placeholder', done => {
      done();
    });
  });
});
