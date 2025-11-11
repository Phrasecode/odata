import { ExpandClause } from '../../types';
import { parseFilter } from './parseFilter';
import { parseOrderBy } from './parseOrderBy';
import { parseSelect } from './parseSelect';

interface RawExpandClause {
  table: string;
  select?: string;
  filter?: string;
  orderBy?: string;
  expand?: RawExpandClause[];
  type: 'inner' | 'left' | 'right';
}

const parseExpand = (query: string) => {
  const parsedData = parseExpandSimple(query);
  const fomattedData = formatParsedData(parsedData);
  return fomattedData;
};

function parseExpandSimple(expandClause: string): RawExpandClause[] {
  if (!expandClause || expandClause.trim() === '') {
    return [];
  }
  const expandItems = splitTopLevel(expandClause, ',');
  const result = expandItems.map(item => parseExpandItem(item.trim()));
  return result;
}

function splitTopLevel(input: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let parenDepth = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === '(') {
      parenDepth++;
    } else if (char === ')') {
      parenDepth--;
    }

    if (char === delimiter && parenDepth === 0) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}

function findMatchingClosingParen(str: string, openIndex: number): number {
  let depth = 1;
  for (let i = openIndex + 1; i < str.length; i++) {
    if (str[i] === '(') {
      depth++;
    } else if (str[i] === ')') {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1; // No matching closing parenthesis found
}

function parseExpandItem(item: string): any {
  const expandObj: any = {
    table: null,
    select: null,
    filter: null,
    orderBy: null,
    skip: null,
    top: null,
    expand: null,
  };

  // Check if it has navigation path (e.g., "User/UserOrders")
  // Use splitTopLevel to avoid splitting inside parentheses
  const navigationParts = splitTopLevel(item, '/');

  if (navigationParts.length > 1) {
    // Handle navigation properties like "User/UserOrders"
    const mainTable = navigationParts[0];
    const nestedTable = navigationParts[1];

    expandObj.table = mainTable;
    expandObj.expand = [
      {
        table: nestedTable,
        select: null,
        filter: null,
        orderBy: null,
        skip: null,
        top: null,
        expand: null,
      },
    ];

    return expandObj;
  }

  // Check if it has options in parentheses
  const parenIndex = item.indexOf('(');

  if (parenIndex === -1) {
    // Simple expand without options
    expandObj.table = item;
    return expandObj;
  }

  // Extract table name and options
  expandObj.table = item.substring(0, parenIndex);

  // Find the matching closing parenthesis instead of using lastIndexOf
  const closingParenIndex = findMatchingClosingParen(item, parenIndex);
  if (closingParenIndex === -1) {
    throw new Error(`Unmatched parenthesis in expand clause: ${item}`);
  }

  const optionsString = item.substring(parenIndex + 1, closingParenIndex);
  const options = parseOptions(optionsString);

  // Apply parsed options
  expandObj.select = options.select;
  expandObj.filter = options.filter;
  expandObj.orderBy = options.orderBy;
  expandObj.skip = options.skip;
  expandObj.top = options.top;
  expandObj.expand = options.expand;

  return expandObj;
}

function parseOptions(optionsString: string): any {
  const options: any = {
    select: null,
    filter: null,
    orderBy: null,
    skip: null,
    top: null,
    expand: null,
  };

  if (!optionsString) return options;

  // Split by semicolon at the top level
  const optionParts = splitTopLevel(optionsString, ';');

  for (const part of optionParts) {
    const trimmedPart = part.trim();

    if (trimmedPart.startsWith('$select=')) {
      options.select = trimmedPart.substring(8); // Remove '$select='
    } else if (trimmedPart.startsWith('$filter=')) {
      options.filter = trimmedPart.substring(8); // Remove '$filter='
    } else if (trimmedPart.startsWith('$orderby=')) {
      options.orderBy = trimmedPart.substring(9); // Remove '$orderby='
    } else if (trimmedPart.startsWith('$top=')) {
      options.top = parseInt(trimmedPart.substring(5), 10); // Remove '$top='
    } else if (trimmedPart.startsWith('$skip=')) {
      options.skip = parseInt(trimmedPart.substring(6), 10); // Remove '$skip='
    } else if (trimmedPart.startsWith('$expand=')) {
      const expandValue = trimmedPart.substring(8); // Remove '$expand='
      options.expand = parseExpandSimple(expandValue);
    }
  }

  return options;
}

function formatParsedData(parsedData: RawExpandClause[]): ExpandClause[] {
  return parsedData.map((item: RawExpandClause) => {
    const select = parseSelect(item.select || '', item.table);
    const filter = parseFilter(item.filter || '', item.table);
    const orderBy = parseOrderBy(item.orderBy || '', item.table);
    const expand = item.expand ? formatParsedData(item.expand) : undefined;
    return {
      ...item,
      select,
      filter,
      orderBy,
      expand,
    };
  });
}
export { parseExpand };
