import {
  ArithmeticOperator,
  ComparisonOperator,
  FilterClause,
  FilterCondition,
  FilterExpression,
} from '../../types';
import { OPERATORS } from '../../utils/constant';
import { BadRequestError } from '../../utils/error-management';

/**
 * Parse OData filter string into FilterClause structure
 */
export const parseFilter = (
  filterClause: string,
  _table: string,
): FilterClause | FilterCondition | undefined => {
  if (filterClause.trim() === '') {
    return undefined;
  }

  const tokens = tokenizeOData(filterClause);
  return parseTokens(tokens);
};

/**
 * Tokenize OData filter string
 */
function tokenizeOData(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < input.length) {
    // Skip whitespace
    if (input[i] === ' ') {
      i++;
      continue;
    }

    // Handle datetime literals
    if (input.substring(i, i + 8).toLowerCase() === 'datetime') {
      let j = i + 8;
      if (j < input.length && (input[j] === '\'' || input[j] === '"')) {
        const quote = input[j];
        let datetimeToken = input.substring(i, j + 1);
        j++;
        while (j < input.length && input[j] !== quote) {
          datetimeToken += input[j];
          j++;
        }
        if (j < input.length) {
          datetimeToken += input[j];
          j++;
        }
        tokens.push(datetimeToken);
        i = j;
        continue;
      }
    }

    // Handle string literals
    if (input[i] === '\'' || input[i] === '"') {
      const quote = input[i];
      let str = quote;
      i++;
      while (i < input.length && input[i] !== quote) {
        if (input[i] === '\\') {
          str += input[i];
          i++;
          if (i < input.length) {
            str += input[i];
            i++;
          }
        } else {
          str += input[i];
          i++;
        }
      }
      if (i < input.length) {
        str += input[i];
        i++;
      }
      tokens.push(str);
      continue;
    }

    // Handle parentheses, commas
    if (input[i] === '(' || input[i] === ')' || input[i] === ',') {
      tokens.push(input[i]);
      i++;
      continue;
    }

    // Handle identifiers, keywords, numbers
    let token = '';
    while (
      i < input.length &&
      input[i] !== ' ' &&
      input[i] !== '(' &&
      input[i] !== ')' &&
      input[i] !== ',' &&
      input[i] !== '\'' &&
      input[i] !== '"'
    ) {
      token += input[i];
      i++;
    }
    if (token) {
      tokens.push(token);
    }
  }

  return tokens;
}

// Helper to check if a token is an arithmetic operator
function isArithmeticOperator(token: string): boolean {
  const op = token.toLowerCase();
  return [
    OPERATORS.ARITHMETIC.ADD,
    OPERATORS.ARITHMETIC.SUB,
    OPERATORS.ARITHMETIC.MUL,
    OPERATORS.ARITHMETIC.DIV,
    OPERATORS.ARITHMETIC.MOD,
  ].includes(op);
}

// Helper to get precedence for arithmetic operators
function getPrecedence(op: string): number {
  const lowerOp = op.toLowerCase();
  if (
    lowerOp === OPERATORS.ARITHMETIC.MUL ||
    lowerOp === OPERATORS.ARITHMETIC.DIV ||
    lowerOp === OPERATORS.ARITHMETIC.MOD
  ) {
    return 2;
  }
  if (lowerOp === OPERATORS.ARITHMETIC.ADD || lowerOp === OPERATORS.ARITHMETIC.SUB) {
    return 1;
  }
  return 0;
}

/**
 * Parse tokens into FilterClause or FilterCondition
 */
function parseTokens(tokens: string[]): FilterClause | FilterCondition | undefined {
  let index = 0;

  function parseLogicalExpression(): FilterClause | FilterCondition {
    const conditions: (FilterCondition | FilterClause)[] = [];
    let logicalOp: 'and' | 'or' = 'and';

    // Parse first condition
    conditions.push(parseCondition());

    // Parse additional conditions with logical operators
    while (
      index < tokens.length &&
      (tokens[index]?.toLowerCase() === 'and' || tokens[index]?.toLowerCase() === 'or')
    ) {
      logicalOp = tokens[index].toLowerCase() as 'and' | 'or';
      index++; // consume logical operator
      conditions.push(parseCondition());
    }

    // If only one condition, return it directly
    if (conditions.length === 1) {
      return conditions[0];
    }

    // Multiple conditions - return FilterClause
    return {
      logicalOperator: logicalOp,
      conditions,
    };
  }

  function parseCondition(): FilterCondition | FilterClause {
    // Handle parenthesized logical expressions
    // We need to peek ahead to determine if this is a logical grouping or arithmetic grouping
    if (tokens[index] === '(') {
      // Save the current index
      const savedIndex = index;
      index++; // consume '('

      // Try to parse as a logical expression
      try {
        const expr = parseLogicalExpression();
        if (tokens[index] === ')') {
          index++; // consume ')'
          // Check if this is followed by a logical operator or end of tokens
          // If so, it's a logical grouping
          if (
            index >= tokens.length ||
            tokens[index]?.toLowerCase() === 'and' ||
            tokens[index]?.toLowerCase() === 'or' ||
            tokens[index] === ')'
          ) {
            return expr;
          }
        }
      } catch (e) {
        // Failed to parse as logical expression, reset and try as arithmetic
      }

      // Reset index and let parseArithmeticExpression handle it
      index = savedIndex;
    }

    // Parse left expression
    const leftExpression = parseArithmeticExpression();

    // Check if this is a boolean function that can be used directly as a condition
    // (e.g., contains(field, 'value'), startswith(field, 'value'), endswith(field, 'value'))
    if (leftExpression.type === 'function' && isBooleanFunction(leftExpression.function?.name)) {
      // Check if there's a comparison operator following
      if (
        index < tokens.length &&
        isComparisonOperator(tokens[index].toLowerCase() as ComparisonOperator)
      ) {
        // Explicit comparison: contains(field, 'value') eq true
        const operator = tokens[index].toLowerCase() as ComparisonOperator;
        index++; // consume operator
        const rightExpression = parseExpression();
        return {
          leftExpression,
          operator,
          rightExpression,
        };
      } else {
        // Direct boolean usage: contains(field, 'value')
        // Convert to: contains(field, 'value') eq true
        return {
          leftExpression,
          operator: 'eq',
          rightExpression: {
            type: 'literal',
            value: true,
          },
        };
      }
    }

    // Parse operator
    if (index >= tokens.length) {
      throw new BadRequestError('Expected comparison operator');
    }

    const operator = tokens[index].toLowerCase() as ComparisonOperator;
    if (!isComparisonOperator(operator)) {
      throw new BadRequestError(`Invalid comparison operator: ${operator}`);
    }
    index++; // consume operator

    // Parse right expression
    const rightExpression = parseExpression();

    return {
      leftExpression,
      operator,
      rightExpression,
    };
  }

  function parsePrimaryExpression(): FilterExpression {
    // Handle parenthesized expressions for arithmetic grouping
    if (tokens[index] === '(') {
      // Check if this is a function call or a parenthesized expression
      // If the previous token is a function name, this is a function call
      // Otherwise, it's a parenthesized arithmetic expression
      if (index > 0 && index - 1 >= 0) {
        const prevToken = tokens[index - 1];
        const prevTokenLower = prevToken?.toLowerCase();
        // Check if previous token could be a function name
        if (
          prevToken &&
          !isComparisonOperator(prevToken) &&
          !isArithmeticOperator(prevToken) &&
          prevTokenLower !== 'and' &&
          prevTokenLower !== 'or' &&
          prevToken !== '(' &&
          prevToken !== ')' &&
          prevToken !== ','
        ) {
          // This is likely a function call, let the caller handle it
          // Don't consume the parenthesis here
        } else {
          // This is a parenthesized arithmetic expression
          index++; // consume '('
          const expr = parseArithmeticExpression();
          if (tokens[index] === ')') {
            index++; // consume ')'
          } else {
            throw new BadRequestError('Expected closing parenthesis');
          }
          return expr;
        }
      } else {
        // At the start or after an operator, this is a parenthesized expression
        index++; // consume '('
        const expr = parseArithmeticExpression();
        if (tokens[index] === ')') {
          index++; // consume ')'
        } else {
          throw new BadRequestError('Expected closing parenthesis');
        }
        return expr;
      }
    }

    // Check if it's a function call
    if (index + 1 < tokens.length && tokens[index + 1] === '(') {
      return parseFunctionExpression();
    }

    // Check if it's a literal
    const token = tokens[index];
    if (isLiteral(token)) {
      index++;
      return {
        type: 'literal',
        value: parseLiteralValue(token),
      };
    }

    // It's a field reference (possibly with navigation path)
    const fieldToken = tokens[index];
    if (!fieldToken) {
      throw new BadRequestError('Expected field, literal, or function');
    }
    index++;

    // Check if this is a navigation path (e.g., "category/categoryName")
    if (fieldToken.includes('/')) {
      const parts = fieldToken.split('/');
      // First part is the navigation property (table), rest is the path to the field
      const table = parts[0];
      const fieldName = parts[parts.length - 1];
      const navigationPath = parts.slice(0, -1); // All parts except the last one

      return {
        type: 'field',
        field: {
          name: fieldName,
          table: table,
          navigationPath: navigationPath.length > 0 ? navigationPath : undefined,
        },
      };
    }

    // Simple field reference without navigation
    return {
      type: 'field',
      field: {
        name: fieldToken,
      },
    };
  }

  // Implements Shunting-yard-like algorithm for arithmetic expressions
  function parseArithmeticExpression(minPrecedence = 0): FilterExpression {
    let leftExpression = parsePrimaryExpression();

    while (
      index < tokens.length &&
      isArithmeticOperator(tokens[index]) &&
      getPrecedence(tokens[index]) >= minPrecedence
    ) {
      const operator = tokens[index].toLowerCase() as ArithmeticOperator;
      const precedence = getPrecedence(operator);
      index++; // consume operator

      let rightExpression = parsePrimaryExpression();

      while (
        index < tokens.length &&
        isArithmeticOperator(tokens[index]) &&
        getPrecedence(tokens[index]) > precedence
      ) {
        rightExpression = parseArithmeticExpression(getPrecedence(tokens[index]));
      }

      leftExpression = {
        type: 'arithmetic',
        arithmetic: {
          operator,
          left: leftExpression,
          right: rightExpression,
        },
      };
    }

    return leftExpression;
  }

  // Alias for the main expression parser
  function parseExpression(): FilterExpression {
    return parseArithmeticExpression();
  }

  function parseFunctionExpression(): FilterExpression {
    const functionName = tokens[index].toLowerCase();
    index++; // consume function name
    index++; // consume '('

    const args: FilterExpression[] = [];

    // Parse function arguments
    while (index < tokens.length && tokens[index] !== ')') {
      if (tokens[index] === ',') {
        index++; // consume comma
        continue;
      }

      args.push(parseExpression());
    }

    if (tokens[index] === ')') {
      index++; // consume ')'
    } else {
      throw new BadRequestError(`Expected ')' after function arguments for ${functionName}`);
    }

    return {
      type: 'function',
      function: {
        name: functionName as any,
        args,
      },
    };
  }

  function isComparisonOperator(op: string): boolean {
    return [
      OPERATORS.COMPARISON.EQUAL,
      OPERATORS.COMPARISON.NOT_EQUAL,
      OPERATORS.COMPARISON.GREATER_THAN,
      OPERATORS.COMPARISON.GREATER_THAN_OR_EQUAL,
      OPERATORS.COMPARISON.LESS_THAN,
      OPERATORS.COMPARISON.LESS_THAN_OR_EQUAL,
      OPERATORS.COLLECTION.IN,
      OPERATORS.COMPARISON.HAS,
    ].includes(op);
  }

  function isBooleanFunction(functionName: string | undefined): boolean {
    if (!functionName) return false;
    const booleanFunctions = [
      OPERATORS.STRING_FUNCTIONS.CONTAINS,
      OPERATORS.STRING_FUNCTIONS.STARTSWITH,
      OPERATORS.STRING_FUNCTIONS.ENDSWITH,
      // Add other boolean functions as needed
    ];
    return booleanFunctions.includes(functionName.toLowerCase());
  }

  function isLiteral(token: string): boolean {
    // String literal
    if (token.startsWith('\'') || token.startsWith('"')) {
      return true;
    }
    // Number
    if (!isNaN(Number(token))) {
      return true;
    }
    // Boolean
    if (token === 'true' || token === 'false') {
      return true;
    }
    // Null
    if (token === 'null') {
      return true;
    }
    // Datetime
    if (token.startsWith('datetime')) {
      return true;
    }
    return false;
  }

  function parseLiteralValue(token: string): any {
    // String literal
    if (token.startsWith('\'') || token.startsWith('"')) {
      return token.slice(1, -1); // Remove quotes
    }
    // Number
    if (!isNaN(Number(token))) {
      return Number(token);
    }
    // Boolean
    if (token === 'true') return true;
    if (token === 'false') return false;
    // Null
    if (token === 'null') return null;
    // Datetime
    if (token.startsWith('datetime')) {
      const dateStr = token.substring(9, token.length - 1); // Remove "datetime'" and "'"
      return new Date(dateStr);
    }
    return token;
  }

  // Start parsing from the top-level logical expression
  const result = parseLogicalExpression();

  if (index !== tokens.length) {
    throw new BadRequestError(`Unexpected token at end of filter: ${tokens[index]}`);
  }

  return result;
}
