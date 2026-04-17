import { BaseControler } from './baseController';

/**
 * Query controller for handling custom SQL query endpoints.
 * Use this controller when you only need custom SQL endpoints without standard OData query support.
 *
 * @example
 * ```typescript
 * export class UserStatsController extends QueryController {
 *   constructor() {
 *     super({
 *       model: UserStats,
 *       endpoint: '/user-stats',
 *     });
 *   }
 *
 *   @Query({
 *     method: 'get',
 *     endpoint: '/by-department',
 *     parameters: [{ name: 'departmentId', type: DataTypes.INTEGER, required: true }],
 *   })
 *   public async getStatsByDepartment(event: QueryControllerEvent) {
 *     return this.rawQueryable(
 *       'SELECT * FROM user_stats WHERE department_id = $departmentId',
 *       { departmentId: event.queryParams.departmentId },
 *     );
 *   }
 * }
 * ```
 */
export class QueryController extends BaseControler {}
