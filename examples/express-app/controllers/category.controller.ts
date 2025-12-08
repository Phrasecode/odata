import { ODataControler, Query, QueryControllerEvent, QueryParser } from '../../../src';
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

  /**
   * Custom endpoint to get active categories using raw SQL.
   */
  @Query({
    method: 'get',
    endpoint: '/active',
    parameters: [{ name: 'limit', type: 'number', required: false, defaultValue: 10 }],
  })
  public async getActiveCategories(event: QueryControllerEvent) {
    const { queryParams } = event;
    return this.rawQueryable('SELECT * FROM categories ORDER BY category_name ASC LIMIT $limit', {
      limit: queryParams.limit,
    });
  }
}
