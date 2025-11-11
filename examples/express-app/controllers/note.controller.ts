import { ODataControler, QueryParser } from '../../../src';
import { Note } from '../models/note';

export class NoteController extends ODataControler {
  constructor() {
    super({
      model: Note,
      allowedMethod: ['get'],
    });
  }

  public async get(query: QueryParser) {
    const result = await this.queryable<Note>(query);
    return result;
  }
}
