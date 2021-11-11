import ILoader = KalturaPlayerTypes.ILoader;

const {RequestBuilder, ResponseTypes} = KalturaPlayer.providers;

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
  constructor(private _checkLiveWithKs: boolean, private _id: boolean) {
    console.log('_checkLiveWithKs, _id', _checkLiveWithKs, _id);
    const headers: Map<string, string> = new Map();
    const request = new RequestBuilder(headers);
    request.service = 'livestream';
    request.action = 'getDetails';
    request.params = {};
    this.requests.push(request);
  }

  set requests(requests: any[]) {
    this._requests = requests;
  }

  get requests(): any[] {
    return this._requests;
  }

  set response(response: any) {
    this._response = response;
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
