import { Model } from '../core/model';
import { QueryParser } from '../serializers/query';
import {
  ColumnMetadata,
  ExpandClause,
  FilterClause,
  IParsedQuery,
  RelationMetadata,
  TableMetadata,
} from '../types';
import { NotFoundError } from '../utils/error-management';

export const convertQueryParser = (
  entityMap: Map<string, typeof Model<any>> = new Map(),
  query: QueryParser,
) => {
  const parsedQuery = query.getParams();
  const convertedQuery = convertColumnNameToColumnIdentifier(parsedQuery, entityMap);
  return convertedQuery;
};

const convertColumnNameToColumnIdentifier = (
  parsedQuery: IParsedQuery | ExpandClause,
  entityMap: Map<string, typeof Model<any>> = new Map(),
  propertyKey?: string,
): IParsedQuery => {
  const rawData = { ...parsedQuery };
  if (propertyKey) {
    rawData.as = propertyKey;
  }

  const table: typeof Model<any> | undefined = entityMap.get(rawData.table);
  if (!table) {
    throw new NotFoundError(`Table name not found ${rawData.table}`, {
      tableName: rawData.table,
    });
  }
  const {
    tableMetadata,
    columnMetadata,
    relationMetadata,
  }: {
    tableMetadata: TableMetadata;
    columnMetadata: ColumnMetadata[];
    relationMetadata: RelationMetadata[];
  } = table.getMetadata();
  // convert table Name
  rawData.table = tableMetadata.tableIdentifier;
  // convert select
  if (rawData.select && rawData.select.length > 0) {
    rawData.select = rawData.select.map(selectColunm => {
      const column = columnMetadata.find(column => {
        if (column.propertyKey === selectColunm.field) {
          return column;
        }
        return undefined;
      });
      if (!column) {
        throw new NotFoundError(`Column ${selectColunm.field} not found`);
      }
      return {
        ...selectColunm,
        field: column.columnIdentifier,
      };
    });
  }
  // convert filter
  if (rawData.filter) {
    rawData.filter = convertFilterColumnNames(
      rawData.filter,
      columnMetadata,
      relationMetadata,
      tableMetadata,
      table,
    );
  }
  // convert orderBy
  if (rawData.orderBy && rawData.orderBy.length > 0) {
    rawData.orderBy = rawData.orderBy.map(orderByColumn => {
      const column = columnMetadata.find(column => {
        if (column.propertyKey === orderByColumn.field) {
          return column;
        }
        return undefined;
      });
      if (!column) {
        throw new NotFoundError(`Column ${orderByColumn.field} not found`);
      }
      return {
        ...orderByColumn,
        field: column.columnIdentifier,
      };
    });
  }
  // convert expand
  if (rawData.expand && rawData.expand.length > 0) {
    rawData.expand = rawData.expand.map(expand => {
      const relation = relationMetadata.find(item => {
        // Match by navigation property name (propertyKey) instead of model name
        if (item.propertyKey === expand.table) {
          return item;
        }
        return undefined;
      });
      if (!relation) {
        throw new NotFoundError(
          `Navigation property '${expand.table}' not found on table '${rawData.table}'. ` +
            `Available navigation properties: ${relationMetadata
              .map(r => r.propertyKey)
              .join(', ')}`,
        );
      }
      // Update expand.table to use the actual model name for recursive processing
      const expandWithModelName = {
        ...expand,
        table: relation.targetModel.getModelName(),
      };
      return convertColumnNameToColumnIdentifier(
        expandWithModelName,
        entityMap,
        relation.propertyKey,
      );
    });
  }

  return rawData;
};

const convertFilterColumnNames = (
  filter: FilterClause | any,
  columnMetadata: ColumnMetadata[],
  relationMetadata?: RelationMetadata[],
  sourceTableMetadata?: TableMetadata,
  sourceModel?: typeof Model<any>,
): FilterClause | any => {
  // Handle single FilterCondition (new format with leftExpression/rightExpression)
  if (filter.leftExpression && filter.operator && !filter.conditions) {
    return {
      ...filter,
      leftExpression: convertFilterExpression(
        filter.leftExpression,
        columnMetadata,
        relationMetadata,
        sourceTableMetadata,
        sourceModel,
      ),
      rightExpression: convertFilterExpression(
        filter.rightExpression,
        columnMetadata,
        relationMetadata,
        sourceTableMetadata,
        sourceModel,
      ),
    };
  }
  // Handle FilterClause with conditions array
  if (filter.conditions) {
    filter.conditions = filter.conditions.map((condition: any) => {
      if ('logicalOperator' in condition) {
        return convertFilterColumnNames(
          condition,
          columnMetadata,
          relationMetadata,
          sourceTableMetadata,
          sourceModel,
        );
      }
      // Recursively convert FilterCondition
      return convertFilterColumnNames(
        condition,
        columnMetadata,
        relationMetadata,
        sourceTableMetadata,
        sourceModel,
      );
    });
  }

  return filter;
};

/**
 * Convert field names in a FilterExpression to column identifiers
 */
const convertFilterExpression = (
  expression: any,
  columnMetadata: ColumnMetadata[],
  relationMetadata?: RelationMetadata[],
  sourceTableMetadata?: TableMetadata,
  sourceModel?: typeof Model<any>,
): any => {
  if (!expression) return expression;

  switch (expression.type) {
    case 'field':
      // Check if this is a navigation path (e.g., category/categoryName)
      if (expression.field?.navigationPath && relationMetadata) {
        // Get the navigation property name (first part of the path)
        const navigationProperty = expression.field.navigationPath[0];

        // Find the relation metadata for this navigation property
        const relation = relationMetadata.find(r => r.propertyKey === navigationProperty);

        if (!relation) {
          throw new NotFoundError(`Navigation property '${String(navigationProperty)}' not found`);
        }

        // Special handling for $count on navigation properties
        if (expression.field?.name === '$count') {
          // Get the target model's metadata for table information
          const targetModel = relation.targetModel;
          const { tableMetadata: targetTableMetadata } = targetModel.getMetadata();

          // Get the foreign key mapping and convert to column identifiers
          const foreignKeyMapping = relation.relation[0]; // Use first mapping

          // Convert property keys to column identifiers
          const targetColumnIdentifier = targetModel.getColumnByName(
            foreignKeyMapping.targetKey,
          ).columnIdentifier;
          const sourceColumnIdentifier = sourceModel?.getColumnByName(
            foreignKeyMapping.sourceKey,
          ).columnIdentifier;

          // Return a special count expression that will be handled by the SQL builder
          return {
            type: 'count',
            count: {
              navigationProperty: navigationProperty,
              relationType: relation.type,
              sourceTable: sourceTableMetadata?.tableIdentifier,
              targetTable: targetTableMetadata.tableIdentifier,
              foreignKey: targetColumnIdentifier,
              sourceKey: sourceColumnIdentifier,
            },
          };
        }

        // Get the target model's metadata
        const targetModel = relation.targetModel;
        const { columnMetadata: targetColumnMetadata, tableMetadata } = targetModel.getMetadata();

        // Find the column in the target model
        const column = targetColumnMetadata.find(col => col.propertyKey === expression.field?.name);

        if (!column) {
          throw new NotFoundError(
            `Column ${String(expression.field?.name)} not found in navigation property ${String(navigationProperty)}`,
          );
        }

        // Return the expression with converted column name and table information
        return {
          ...expression,
          field: {
            ...expression.field,
            name: column.columnIdentifier,
            table: tableMetadata.tableIdentifier,
          },
        };
      }

      // Simple field reference without navigation
      const column = columnMetadata.find(column => {
        return column.propertyKey === expression.field?.name;
      });
      if (!column) {
        throw new NotFoundError(`Column ${expression.field?.name} not found`);
      }
      return {
        ...expression,
        field: {
          ...expression.field,
          name: column.columnIdentifier,
        },
      };

    case 'function':
      // Recursively convert function arguments
      if (expression.function && expression.function.args) {
        return {
          ...expression,
          function: {
            ...expression.function,
            args: expression.function.args.map((arg: any) =>
              convertFilterExpression(
                arg,
                columnMetadata,
                relationMetadata,
                sourceTableMetadata,
                sourceModel,
              ),
            ),
          },
        };
      }
      return expression;

    case 'literal':
      // Literals don't need conversion
      return expression;

    case 'arithmetic':
      // Recursively convert left and right operands of arithmetic expressions
      if (expression.arithmetic) {
        return {
          ...expression,
          arithmetic: {
            ...expression.arithmetic,
            left: convertFilterExpression(
              expression.arithmetic.left,
              columnMetadata,
              relationMetadata,
              sourceTableMetadata,
              sourceModel,
            ),
            right: convertFilterExpression(
              expression.arithmetic.right,
              columnMetadata,
              relationMetadata,
              sourceTableMetadata,
              sourceModel,
            ),
          },
        };
      }
      return expression;

    default:
      return expression;
  }
};
