import ILoader = KalturaPlayerTypes.ILoader;

const {RequestBuilder} = KalturaPlayer.providers;

interface GetStreamDetailsLoaderParams {
  ks: string | null;
  id: string;
}

export enum KalturaLiveStreamBroadcastStatus {
  live = 3,
  offline = 1,
  preview = 2
}

export class GetStreamDetailsLoader implements ILoader {
  _requests: any[] = [];
  _response: any = {};

  static get id(): string {
    return 'kaltura-live';
  }

  /**
   * @constructor
   * @param {Object} params loader params
   */
  constructor({ks, id}: GetStreamDetailsLoaderParams) {
    const headers: Map<string, string> = new Map();
    const request = new RequestBuilder(headers);
    request.service = 'livestream';
    request.action = 'getDetails';
    request.params = {
      id
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
