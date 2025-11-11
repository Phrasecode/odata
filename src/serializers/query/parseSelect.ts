import { SelectField } from '../../types';

const parseSelect = (selectClause: string, table: string): SelectField[] => {
  const fields: string[] = selectClause
    .split(',')
    .map(field => field.trim())
    .filter(field => {
      return field !== null && field.length > 0 && field !== '*';
    });
  const formattedFields: SelectField[] = fields.map(field => {
    return {
      table: table,
      field,
    };
  });

  return formattedFields;
};

export { parseSelect };
