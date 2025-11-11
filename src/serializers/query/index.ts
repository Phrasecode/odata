import { DataSource, Model } from '../../core';
import {
  ExpandClause,
  FilterClause,
  FilterCondition,
  IParsedQuery,
  IQueryParseOptions,
  IRawSearchParams,
  OrderByClause,
  SelectField,
} from '../../types';
import { BadRequestError } from '../../utils/error-management';
import { Logger } from '../../utils/logger';
import { parseApply } from './parseApply';
import { parseCompute } from './parseCompute';
import { parseExpand } from './parseExpand';
import { parseFilter } from './parseFilter';
import { parseOrderBy } from './parseOrderBy';
import { parseSelect } from './parseSelect';

/**
 * QueryParser parses OData query strings into structured query objects.
 * It handles $select, $filter, $orderby, $expand, $skip, and $top query options.
 *
 * @example
 * ```typescript
 * const queryParser = new QueryParser(
 *   '/users?$select=name,email&$filter=age gt 18&$orderby=name asc&$top=10',
 *   dataSource,
 *   User,
 *   { defaultTop: 100, defaultSkip: 0 }
 * );
 *
 * const results = await dataSource.execute(queryParser);
 * ```
 */
class QueryParser {
  private readonly dataSource: DataSource;
  private readonly options: IQueryParseOptions;
  private readonly model: typeof Model<any>;
  /** Original query string */
  public queryString: string;
  /** Base table/model name being queried */
  public baseTableName!: string;

  /** Fields to select in the result */
  public select: SelectField[] = [];
  /** Sorting specifications */
  public orderBy: OrderByClause[] = [];
  /** Related entities to expand (join) */
  public expand: ExpandClause[] = [];
  /** Filter conditions */
  public filter?: FilterClause | FilterCondition;
  /** Number of records to skip (pagination) */
  public skip = 0;
  /** Maximum number of records to return (pagination) */
  public top = 0;
  /** $apply clause */
  public apply?: any; // TODO: Define ApplyClause type
  /** $count clause */
  public count = false;
  /** $compute clause */
  public compute: any[] = []; // TODO: Define ComputeClause type

  /**
   * Creates a new QueryParser instance and parses the query string.
   *
   * @param queryString - Full OData query string (e.g., '/users?$select=name&$filter=age gt 18')
   * @param dataSource - DataSource instance for database operations
   * @param model - Model class being queried
   * @param options - Optional parser configuration (default pagination values)
   */
  constructor(
    queryString: string,
    dataSource: DataSource,
    model: typeof Model<any>,
    options?: IQueryParseOptions,
  ) {
    this.queryString = queryString;
    this.dataSource = dataSource;
    this.options = options || {};
    this.model = model;
    this.parse(queryString);
  }

  private parse(queryString: string) {
    try {
      const urlParts = queryString.split('?');
      const searchParams = urlParts[1];
      const rawSearchParams: IRawSearchParams = this.getSearchParams(searchParams);
      this.baseTableName = this.model.name;

      // Validate query parameters according to OData V4 standards
      this.validateQueryParameters(rawSearchParams);

      this.processRawSearchParams(rawSearchParams);
    } catch (error) {
      Logger.getLogger().error(`Error parsing query ${queryString}`, error);
      throw error;
    }
  }

  private getSearchParams(searchParams: string) {
    const params = new URLSearchParams(searchParams);
    const paramObject: IRawSearchParams = {
      select: '*',
      filter: '',
      orderBy: '',
      expand: '',
      skip: 0,
      top: 0,
      apply: '',
      count: '',
      compute: '',
    };
    params.forEach((value, key) => {
      switch (key.toLowerCase()) {
        case '$select':
          paramObject['select'] = value;
          break;
        case '$filter':
          paramObject['filter'] = value;
          break;
        case '$orderby':
          paramObject['orderBy'] = value;
          break;
        case '$expand':
          paramObject['expand'] = value;
          break;
        case '$skip':
          paramObject['skip'] = Number.parseInt(value, 10);
          break;
        case '$top':
          paramObject['top'] = Number.parseInt(value, 10);
          break;
        case '$apply':
          paramObject['apply'] = value;
          break;
        case '$count':
          paramObject['count'] = value;
          break;
        case '$compute':
          paramObject['compute'] = value;
          break;
      }
    });
    return paramObject;
  }

  private processRawSearchParams(rawSearchParams: IRawSearchParams) {
    this.select = parseSelect(rawSearchParams.select, this.baseTableName);
    this.orderBy = parseOrderBy(rawSearchParams.orderBy, this.baseTableName);
    this.expand = parseExpand(rawSearchParams.expand);
    this.filter = parseFilter(rawSearchParams.filter, this.baseTableName);
    this.top = rawSearchParams.top || this.options.defaultTop || 0;
    this.skip = rawSearchParams.skip || this.options.defaultSkip || 0;
    this.count = rawSearchParams.count === 'true'; // $count=true
    this.apply = parseApply(rawSearchParams.apply);
    this.compute = parseCompute(rawSearchParams.compute);
  }

  /**
   * Validates query parameters according to OData V4 standards
   */
  private validateQueryParameters(params: IRawSearchParams) {
    // 1. Validate basic parameter types
    this.validateBasicParameters(params);

    // 2. Validate $skip and $top (must be non-negative integers)
    this.validateSkipAndTop(params.skip, params.top);
  }

  /**
   * Validates basic parameter types and OData V4 compliance
   */
  private validateBasicParameters(_params: IRawSearchParams) {
    // Check for invalid OData query parameters
    const validODataParams = [
      '$select',
      '$filter',
      '$orderby',
      '$expand',
      '$skip',
      '$top',
      '$apply',
      '$count',
      '$compute',
    ];
    const urlParams = new URLSearchParams(this.queryString.split('?')[1] || '');

    for (const [key] of urlParams) {
      if (key.startsWith('$') && !validODataParams.includes(key)) {
        throw new BadRequestError(
          `Invalid OData query parameter: ${key}. Valid parameters are: ${validODataParams.join(
            ', ',
          )}`,
        );
      }
    }
  }

  /**
   * Validates $skip and $top parameters
   */
  private validateSkipAndTop(skip?: number, top?: number) {
    if (skip !== undefined) {
      if (Number.isNaN(skip) || !Number.isInteger(skip) || skip < 0) {
        throw new BadRequestError(`$skip must be a non-negative integer, got: ${skip}`);
      }
    }

    if (top !== undefined) {
      if (Number.isNaN(top) || !Number.isInteger(top) || top < 0) {
        throw new BadRequestError(`$top must be a non-negative integer, got: ${top}`);
      }
      if (top > 1000) {
        throw new BadRequestError(`$top cannot exceed 1000, got: ${top}`);
      }
    }
  }

  /**
   * Set the select fields for the query.
   * @param select - Array of fields to select
   */
  public setSelect(select: SelectField[]) {
    this.select = select;
  }

  /**
   * Set the order by clauses for the query.
   * @param orderBy - Array of sorting specifications
   */
  public setOrderBy(orderBy: OrderByClause[]) {
    this.orderBy = orderBy;
  }

  /**
   * Set the expand clauses for the query.
   * @param expand - Array of related entities to expand
   */
  public setExpand(expand: ExpandClause[]) {
    this.expand = expand;
  }

  /**
   * Set the filter clause for the query.
   * @param filter - Filter conditions
   */
  public setFilter(filter: FilterClause) {
    this.filter = filter;
  }

  /**
   * Set the maximum number of records to return.
   * @param top - Maximum number of records
   */
  public setTop(top: number) {
    this.top = top;
  }

  /**
   * Set the number of records to skip.
   * @param skip - Number of records to skip
   */
  public setSkip(skip: number) {
    this.skip = skip;
  }

  /**
   * Get the parsed query parameters.
   * @returns Structured query object ready for execution
   */
  public getParams(): IParsedQuery {
    return {
      table: this.baseTableName,
      select: this.select,
      orderBy: this.orderBy,
      expand: this.expand,
      filter: this.filter,
      top: this.top,
      skip: this.skip,
      count: this.count,
    };
  }

  /**
   * Get the DataSource instance.
   * @returns The DataSource used by this parser
   */
  public getDataSource() {
    return this.dataSource;
  }
}

export { QueryParser };
