import { BadRequestError } from '../../utils/error-management';

export const parseApply = (applyClause: string): any => {
  if (!applyClause) return undefined;
  // TODO: Implement full $apply parsing for OData V4
  // This is a complex feature involving transformations like groupby, aggregate, filter, etc.
  // For now, we will throw an error to indicate it's not fully supported.
  throw new BadRequestError(`$apply is not fully implemented yet. Received: ${applyClause}`);
};
