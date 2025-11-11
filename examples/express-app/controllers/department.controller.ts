import { ODataControler, QueryParser } from '../../../src';
import { Department } from '../models/department';

export class DepartmentController extends ODataControler {
  constructor() {
    super({
      model: Department,
      allowedMethod: ['get'],
    });
  }

  public async get(query: QueryParser) {
    const result = await this.queryable<Department>(query);
    return result;
  }
}
