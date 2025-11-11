import { ODataControler, QueryParser } from '../../../src';
import { Category } from '../models/category';

export class CategoryController extends ODataControler {
  constructor() {
    super({
      model: Category,
      allowedMethod: ['get'],
    });
  }

  public async get(query: QueryParser) {
    const result = await this.queryable<Category>(query);
    return result;
  }
}
