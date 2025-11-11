import { ODataControler, QueryParser } from '../../../src';
import { Role } from '../models/role';

export class RoleController extends ODataControler {
  constructor() {
    super({
      model: Role,
      allowedMethod: ['get'],
    });
  }

  public async get(query: QueryParser) {
    const result = await this.queryable<Role>(query);
    return result;
  }
}
