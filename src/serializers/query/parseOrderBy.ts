import { OrderByClause } from '../../types';

const parseOrderBy = (orderByClause: string, table: string): OrderByClause[] => {
  if (orderByClause.trim() === '') {
    return [];
  }
  const orderItems = orderByClause.split(',');

  const orderByFields: OrderByClause[] = orderItems.map(item => {
    const parts = item.trim().split(/\s+/);
    return {
      field: parts[0],
      table: table,
      direction: parts[1]?.toLowerCase() === 'desc' ? 'desc' : 'asc',
    };
  });
  return orderByFields;
};

export { parseOrderBy };
