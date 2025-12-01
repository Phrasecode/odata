interface IQueryParseOptions {
  defaultTop?: number;
  defaultSkip?: number;
  expandDepth?: number;
  selectDepth?: number;
  maxTop?: number;
  maxSkip?: number;
}
interface IRawSearchParams {
  select: string;
  filter: string;
  orderBy: string;
  expand: string;
  skip: number;
  top: number;
  apply: string;
  count: string;
  compute: string;
}
interface IParsedQuery {
  select?: SelectField[];
  table: string;
  filter?: FilterClause | FilterCondition;
  orderBy?: OrderByClause[];
  skip?: number;
  top?: number;
  expand?: ExpandClause[];
  count?: boolean;
  as?: string;
}

interface SelectField {
  field: string;
  table: string; // Table alias if from joined table
  alias?: string; // Column alias
}

interface OrderByClause {
  field: string;
  table: string;
  direction: 'asc' | 'desc';
}

interface ExpandClause {
  table: string;
  select?: SelectField[];
  filter?: FilterClause | FilterCondition;
  orderBy?: OrderByClause[];
  skip?: number;
  top?: number;
  expand?: ExpandClause[];
  as?: string;
}

/**
 * Main filter clause supporting logical grouping
 */
interface FilterClause {
  logicalOperator: 'and' | 'or' | 'not';
  conditions: (FilterCondition | FilterClause)[];
}

/**
 * Represents a single filter condition
 * Now supports expressions on both sides of the operator
 */
interface FilterCondition {
  leftExpression: FilterExpression; // Left side of comparison
  operator: ComparisonOperator; // Comparison operator
  rightExpression: FilterExpression; // Right side of comparison
}

/**
 * Represents any expression that can appear in a filter
 */
interface FilterExpression {
  /**
   * The type of expression:
   * - 'field': Database column/property reference (e.g., 'name', 'age', 'department/name')
   * - 'literal': Constant value (e.g., 'John', 18, true, null, Date)
   * - 'function': OData function call (e.g., tolower(name), year(createdAt), contains(email, '@gmail.com'))
   * - 'arithmetic': Mathematical operation (e.g., price mul 1.1, quantity add 5, total sub discount)
   */
  type: 'field' | 'literal' | 'function' | 'arithmetic';

  // For type='field': Reference to a database column/property
  field?: FieldReference;

  // For type='literal': Constant value (string, number, boolean, null, Date)
  value?: any;

  // For type='function': OData function call with arguments
  function?: FilterFunction;

  // For type='arithmetic': Mathematical operation (add, sub, mul, div, mod)
  arithmetic?: ArithmeticExpression;
}

/**
 * Field reference with optional table/navigation path
 */
interface FieldReference {
  name: string; // Field name (e.g., 'email', 'username')
  table?: string; // Table/model name (e.g., 'CustomUser')
  navigationPath?: string[]; // For nested navigation (e.g., ['myDepartment', 'departmentName'])
}

/**
 * Represents a function call with arguments
 * Supports both simple and complex nested functions
 */
interface FilterFunction {
  name: FunctionName; // Function name
  args: FilterExpression[]; // Function arguments (can be fields, literals, or other functions)
}

/**
 * Represents an arithmetic expression
 */
interface ArithmeticExpression {
  operator: ArithmeticOperator;
  left: FilterExpression;
  right: FilterExpression;
}

/**
 * All supported OData functions
 */
type FunctionName =
  // String functions
  | 'tolower'
  | 'toupper'
  | 'trim'
  | 'concat'
  | 'substring'
  | 'indexof'
  | 'length'
  | 'contains'
  | 'startswith'
  | 'endswith'
  // Date functions
  | 'year'
  | 'month'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'now'
  | 'date'
  | 'time'
  // Math functions
  | 'round'
  | 'floor'
  | 'ceiling'
  // Type functions
  | 'cast'
  // Aggregate functions (for lambda expressions)
  | 'any'
  | 'all'
  | 'count';

/**
 * Comparison operators
 */
type ComparisonOperator = 'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le' | 'in' | 'has';

/**
 * Arithmetic operators
 */
type ArithmeticOperator = 'add' | 'sub' | 'mul' | 'div' | 'mod';

/**
 * Lambda expression for collection navigation (any/all)
 */
// interface LambdaExpression {
//   operator: 'any' | 'all';
//   variable: string; // Lambda variable (e.g., 'n' in "notes/any(n: ...)")
//   navigationPath: string[]; // Path to collection (e.g., ['notes'])
//   condition: FilterCondition | FilterClause; // The lambda condition
// }

export {
  ArithmeticExpression,
  ArithmeticOperator,
  ComparisonOperator,
  ExpandClause,
  FieldReference,
  FilterClause,
  FilterCondition,
  FilterExpression,
  FilterFunction,
  FunctionName,
  IParsedQuery,
  IQueryParseOptions,
  IRawSearchParams,
  OrderByClause,
  SelectField,
};
