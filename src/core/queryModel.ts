import { Model } from './model';

export class QueryModel<T> extends Model<T> {
  public static readonly isCustomQuery = true;
}
