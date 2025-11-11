import { ODataControler, QueryParser } from '../../../src';
import { Permission } from '../models/permission';

export class PermissionController extends ODataControler {
  constructor() {
    super({
      model: Permission,
      allowedMethod: ['get'],
    });
  }

  public async get(query: QueryParser) {
    const result = await this.queryable<Permission>(query);
    return result;
  }
}
