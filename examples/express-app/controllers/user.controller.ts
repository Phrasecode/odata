import { ODataControler, QueryParser } from '../../../src';
import { CustomUser } from '../models/user';

export class UserController extends ODataControler {
  constructor() {
    super({
      model: CustomUser,
      allowedMethod: ['get'],
    });
  }

  public async get(query: QueryParser) {
    const result = await this.queryable<CustomUser>(query);
    return result;
  }
}
