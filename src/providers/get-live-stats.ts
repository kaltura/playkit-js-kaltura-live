import ILoader = KalturaPlayerTypes.ILoader;

const {RequestBuilder} = KalturaPlayer.providers;

interface GetLiveStatsLoaderParams {
  ks: string | null;
  entryId: string;
}

export class GetLiveStatsLoader implements ILoader {
  _requests: any[] = [];
  _response: any = {};

  static get id(): string {
    return 'kaltura-live-stats';
  }

  /**
   * @constructor
   * @param {Object} params loader params
   */
  constructor({ks, entryId}: GetLiveStatsLoaderParams) {
    const headers: Map<string, string> = new Map();
    const request = new RequestBuilder(headers);
    request.service = 'livestream';
    request.action = 'getLiveStreamStats';
    request.params = {
      entryId
    };
    if (ks) {
      request.params.ks = ks;
    }
    this.requests.push(request);
  }

  set requests(requests: any[]) {
    this._requests = requests;
  }

  get requests(): any[] {
    return this._requests;
  }

  set response(response: any) {
    this._response = response[0]?.data || {};
  }

  get response(): any {
    return this._response;
  }

  /**
   * Loader validation function
   * @function
   * @returns {boolean} Is valid
   */
  isValid(): boolean {
    return true;
  }
}
