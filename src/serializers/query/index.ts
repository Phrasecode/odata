import { Model } from '../../core';
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
import { QUERY_DEFAULTS } from '../../utils/constant';
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
 *   User,
 *   { maxTop: 1000, maxSkip: 10000 }
 * );
 * ```
 */
class QueryParser {
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
   * @param model - Model class being queried
   * @param options - Optional parser configuration (default pagination values)
   */
  constructor(queryString: string, model: typeof Model<any>, options?: IQueryParseOptions) {
    this.queryString = queryString;
    this.options = options || {};
    this.model = model;
    this.parse(queryString);
  }

  private parse(queryString: string) {
    if (typeof queryString !== 'string') {
      throw new BadRequestError('Query string must be a string');
    }
    try {
      const urlParts = queryString.split('?');
      const searchParams = urlParts[1];
      const rawSearchParams: IRawSearchParams = this.getSearchParams(searchParams);
      this.baseTableName = this.model.name;

      // Validate query parameters according to OData V4 standards
      this.validateQueryParameters(rawSearchParams);

      this.processRawSearchParams(rawSearchParams);
      
      // Validate parsed structures against configured limits
      this.validateExpandDepth(this.expand);
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
    this.top = rawSearchParams.top ?? 0;
    this.skip = rawSearchParams.skip ?? 0;
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
   * Validates $skip and $top parameters against configured limits
   */
  private validateSkipAndTop(skip?: number, top?: number) {
    if (skip !== undefined) {
      if (Number.isNaN(skip) || !Number.isInteger(skip) || skip < 0) {
        throw new BadRequestError(`$skip must be a non-negative integer, got: ${skip}`);
      }
      const maxSkip = this.options.maxSkip ?? QUERY_DEFAULTS.MAX_SKIP;
      if (skip > maxSkip) {
        throw new BadRequestError(`$skip cannot exceed ${maxSkip}, got: ${skip}`);
      }
    }

    if (top !== undefined) {
      if (Number.isNaN(top) || !Number.isInteger(top) || top < 0) {
        throw new BadRequestError(`$top must be a non-negative integer, got: ${top}`);
      }
      const maxTop = this.options.maxTop ?? QUERY_DEFAULTS.MAX_TOP;
      if (top > maxTop) {
        throw new BadRequestError(`$top cannot exceed ${maxTop}, got: ${top}`);
      }
    }
  }

  /**
   * Validates that the expansion depth does not exceed the configured limit
   */
  private validateExpandDepth(expandClauses: ExpandClause[]) {
    const maxDepth = this.options.expandDepth;
    if (maxDepth === undefined || !expandClauses || expandClauses.length === 0) {
      return;
    }

    const calculateDepth = (clauses: ExpandClause[]): number => {
      if (!clauses || clauses.length === 0) return 0;
      let depth = 1;
      for (const clause of clauses) {
        if (clause.expand && clause.expand.length > 0) {
          depth = Math.max(depth, 1 + calculateDepth(clause.expand));
        }
      }
      return depth;
    };

    const currentDepth = calculateDepth(expandClauses);
    if (currentDepth > maxDepth) {
      throw new BadRequestError(`$expand depth cannot exceed ${maxDepth}, got: ${currentDepth}`);
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
}

export { QueryParser };
