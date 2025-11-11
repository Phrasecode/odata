import { ODataControler, QueryParser } from '../../../src';
import { Tag } from '../models/tag';

export class TagController extends ODataControler {
  constructor() {
    super({
      model: Tag,
      allowedMethod: ['get'],
    });
  }

  public async get(query: QueryParser) {
    const result = await this.queryable<Tag>(query);
    return result;
  }
}
