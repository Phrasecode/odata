export const QUERY_OPTIONS = {
  SELECT: '$select',
  FILTER: '$filter',
  ORDERBY: '$orderby',
  EXPAND: '$expand',
  SKIP: '$skip',
  TOP: '$top',
  APPLY: '$apply', // not implemented
  COUNT: '$count', // not implemented
  COMPUTE: 'compute', // not implemented
};

export const QUERY_DEFAULTS = {
  /** Default maximum value allowed for $top */
  MAX_TOP: 1000,
  /** Default maximum value allowed for $skip */
  MAX_SKIP: 1000,
};

export enum APPLY_OPTIONS {
  GROUPBY = 'groupby',
  AGGREGATE = 'aggregate',
}

export enum AGGREGATE_OPTIONS {
  COUNT = '$count',
  MIN = 'min',
  MAX = 'max',
  SUM = 'sum',
  AVERAGE = 'average',
}

export const OPERATORS = {
  LOGICAL: {
    AND: 'and',
    OR: 'or',
    NOT: 'not',
  },
  COMPARISON: {
    EQUAL: 'eq',
    NOT_EQUAL: 'ne',
    GREATER_THAN: 'gt',
    GREATER_THAN_OR_EQUAL: 'ge',
    LESS_THAN: 'lt',
    LESS_THAN_OR_EQUAL: 'le',
    HAS: 'has', // not implemented and need to check $filter=PropertyName has EnumType'FlagValue'
  },
  IN: 'in',
  GROUPING: {
    OPEN: '(',
    CLOSE: ')',
  },
  STRING_FUNCTIONS: {
    TOLOWER: 'tolower',
    TOUPPER: 'toupper',
    TRIM: 'trim',
    SUBSTRING: 'substring',
    CONTAINS: 'contains',
    ENDSWITH: 'endswith',
    STARTSWITH: 'startswith',
    INDEX_OF: 'indexof',
    LENGTH: 'length',
    CONCAT: 'concat',
  },
  DATE_FUNCTIONS: {
    DATE: 'date',
    TIME: 'time',
    DAY: 'day',
    MONTH: 'month',
    YEAR: 'year',
    HOUR: 'hour',
    MINUTE: 'minute',
    SECOND: 'second',
    NOW: 'now',
  },
  ARITHMETIC: {
    ADD: 'add',
    SUB: 'sub',
    MUL: 'mul',
    DIV: 'div',
    MOD: 'mod',
  },
  MATH_FUNCTIONS: {
    ROUND: 'round',
    FLOOR: 'floor',
    CEILING: 'ceiling',
  },
  TYPE_FUNCTIONS: {
    CAST: 'cast',
  },
  COLLECTION: {
    IN: 'in',
  },
};

export enum ERROR_CODES {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  UNAUTHORIZED_ERROR = 'UNAUTHORIZED_ERROR',
  FORBIDDEN_ERROR = 'FORBIDDEN_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  BAD_REQUEST_ERROR = 'BAD_REQUEST_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export enum STATUS_CODES {
  VALIDATION_ERROR = 400,
  NOT_FOUND_ERROR = 404,
  UNAUTHORIZED_ERROR = 401,
  FORBIDDEN_ERROR = 403,
  CONFLICT_ERROR = 409,
  BAD_REQUEST_ERROR = 400,
  INTERNAL_SERVER_ERROR = 500,
}

export const FUTUR_OPERATORS = {
  SEARCH: 'search',
  COMPUTE: 'compute',
  DATE_FUNCTIONS: {
    FRACTIONAL_SECONDS: 'fractionalseconds', // not implemented,
    TOTAL_OFFSET_MINUTES: 'totaloffsetminutes', // not implemented
    MAX_DATETIME: 'maxdatetime', // not implemented,
    MIN_DATETIME: 'mindatetime', // not implemented
  },
  GEO: {
    DISTANCE: 'geo.distance', // not implemented
    INTERSECTS: 'geo.intersects', // not implemented
  },
  COLLECTION: {
    ANY: 'any', // not implemented
    ALL: 'all', // not implemented
  },
  ISOF: 'isof', // not implemented /Orders?$filter=isof(ShipCountry, 'Edm.String')
};

export enum EndpointNamingConvention {
  // ModelName: ProductCategories -> Endpoint: ProductCategories
  AS_MODEL_NAME = 'AS_MODEL_NAME',
  // ModelName: ProductCategories -> Endpoint: productcategories
  LOWER_CASE = 'LOWER_CASE',
  // ModelName: ProductCategories -> Endpoint: product-categories
  KEBAB_CASE = 'KEBAB_CASE',
}
