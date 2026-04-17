import { QueryMethodMetadata, QueryOptions } from '../types';
import { BadRequestError } from '../utils/error-management';

/**
 * Metadata key for storing query method information
 */
export const QUERY_METHOD_METADATA_KEY = Symbol('query_method');

/**
 * Decorator to define a custom query endpoint on a controller.
 * Use this to create custom routes that execute raw SQL queries.
 *
 * @param options - Configuration for the custom endpoint
 * @returns A method decorator function
 *
 * @example
 * ```typescript
 * class UserController extends ODataControler {
 *   constructor() {
 *     super({ model: User, allowedMethod: ['get'] });
 *   }
 *
 *   @Query({
 *     method: 'get',
 *     endpoint: '/active',
 *     parameters: [
 *       { name: 'status', type: DataTypes.STRING, required: true },
 *       { name: 'limit', type: DataTypes.INTEGER, required: false, defaultValue: 100 }
 *     ]
 *   })
 *   public async getActiveUsers(event: QueryControllerEvent) {
 *     const { status, limit } = event.queryParams;
 *     return this.rawQueryable(
 *       'SELECT * FROM users WHERE status = $status LIMIT $limit',
 *       { status, limit }
 *     );
 *   }
 * }
 * ```
 */
export function Query(options: QueryOptions): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    if (typeof propertyKey === 'symbol') {
      throw new BadRequestError('Symbol properties are not supported for @Query decorator');
    }

    const metadata: QueryMethodMetadata = {
      methodName: propertyKey,
      method: options.method,
      endpoint: options.endpoint,
      parameters: options.parameters || [],
    };

    // Get or create the query methods map on the constructor
    const constructor = target.constructor as any;
    if (!constructor.__queryMethods) {
      constructor.__queryMethods = new Map<string, QueryMethodMetadata>();
    }

    constructor.__queryMethods.set(propertyKey, metadata);

    return descriptor;
  };
}

/**
 * Get all query methods registered on a controller class
 *
 * @param target - The controller class or instance
 * @returns Map of method names to their metadata
 */
export function getQueryMethods(target: any): Map<string, QueryMethodMetadata> {
  const constructor = target.constructor || target;
  return constructor.__queryMethods || new Map();
}
