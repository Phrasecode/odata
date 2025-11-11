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
    TRIM: 'trim', // not implemented
    SUBSTRING: 'substring',
    CONTAINS: 'contains',
    ENDSWITH: 'endswith',
    STARTSWITH: 'startswith',
    INDEX_OF: 'indexof',
    LENGTH: 'length',
    CONCAT: 'concat', // not implemented
  },
  DATE_FUNCTIONS: {
    DATE: 'date', // not implemented
    TIME: 'time', // not implemented
    DAY: 'day', // not implemented
    MONTH: 'month', // not implemented
    YEAR: 'year', // not implemented
    HOUR: 'hour', // not implemented
    MINUTE: 'minute', // not implemented
    SECOND: 'second', // not implemented,
    NOW: 'now', // not implemented,
  },
  ARITHMETIC: {
    ADD: 'add', // not implemented /products?$filter=Price add 10 gt 100
    SUB: 'sub', // not implemented
    MUL: 'mul', // not implemented /products?$filter=Price mul 2 lt 500
    DIV: 'div', // not implemented
    MOD: 'mod', // not implemented
  },
  MATH_FUNCTIONS: {
    ROUND: 'round', // not implemented
    FLOOR: 'floor', // not implemented Orders?$filter=floor(Freight) eq 33 or Orders?$filter=ceiling(Freight) eq 33d
    CEILING: 'ceiling', // not implemented
  },
  TYPE_FUNCTIONS: {
    CAST: 'cast', // not implemented
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
