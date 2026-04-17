import { Query, QueryController, QueryControllerEvent } from '../../../src';
import { UserRole } from '../models/';

export class UserRoleController extends QueryController {
  constructor() {
    super({
      model: UserRole,
      allowedMethod: ['get'],
    });
  }

  /**
   * Custom endpoint to get active categories using raw SQL.
   */
  @Query({
    method: 'get',
    endpoint: '/role',
    parameters: [
      { name: 'limit', type: 'number', required: false, defaultValue: 10 },
      { name: 'user_id', type: 'number', required: true },
    ],
  })
  public async getUserRole(event: QueryControllerEvent) {
    const { queryParams } = event;
    return this.rawQueryable(
      `
        SELECT 
            users.user_id, 
            users.username, 
            users.email, 
            users.is_active, 
            users.created_at, 
            departments.department_name, 
            roles.role_name 
        FROM 
            users 
            INNER JOIN departments ON users.department_id = departments.id 
            LEFT JOIN user_roles ON user_roles.user_id = users.user_id 
            LEFT JOIN roles ON roles.role_id = user_roles.role_id 
        WHERE 
            users.user_id = $userId 
        limit 
            $limit;
`,
      {
        limit: queryParams.limit,
        userId: queryParams.user_id,
      },
    );
  }
}
