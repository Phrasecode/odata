import { IDataType, IMethod } from '.';

/**
 * Parameter definition for query methods
 */
export interface QueryParameterDefinition {
  /** Parameter name */
  name: string;
  /** Parameter type: IDataType */
  type: IDataType;
  /** Whether the parameter is required */
  required?: boolean;
  /** Default value if not provided */
  defaultValue?: unknown;
}

/**
 * Options for the @Query decorator
 */
export interface QueryOptions {
  /** HTTP method for the endpoint */
  method: IMethod;
  /** Custom endpoint path (will be appended to controller endpoint) */
  endpoint: string;
  /** Parameter definitions for the query method */
  parameters?: QueryParameterDefinition[];
}

/**
 * Metadata stored for each query method
 */
export interface QueryMethodMetadata {
  /** The method name on the controller */
  methodName: string;
  /** HTTP method */
  method: IMethod;
  /** Custom endpoint path */
  endpoint: string;
  /** Parameter definitions */
  parameters: QueryParameterDefinition[];
}

/**
 * Event object passed to @Query decorated methods
 */
export interface QueryControllerEvent {
  /** Full request path including query string */
  path: string;
  /** Base path without query string */
  basepath: string;
  /** Parsed and validated query parameters */
  queryParams: Record<string, unknown>;
}
