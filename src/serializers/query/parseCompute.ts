import { BadRequestError } from '../../utils/error-management';

export const parseCompute = (computeClause: string): any => {
  if (!computeClause) return undefined;
  // TODO: Implement full $compute parsing for OData V4
  // This is a complex feature involving transformations like groupby, aggregate, filter, etc.
  // For now, we will throw an error to indicate it's not fully supported.
  throw new BadRequestError(`$compute is not fully implemented yet. Received: ${computeClause}`);
};
