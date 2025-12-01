import { Express } from 'express';
import { DataSource, ExpressRouter, ODataControler } from '../../src';
import {
  CategoryController,
  DepartmentController,
  NoteController,
  PermissionController,
  RoleController,
  TagController,
} from './controllers';
import { Category } from './models/category';
import { Department } from './models/department';
import { Note } from './models/note';
import { Permission } from './models/permission';
import { Role } from './models/role';
import { Tag } from './models/tag';
import { CustomUser } from './models/user';

const createSchema = (app: Express, dbPath: string) => {
  const dataSource = new DataSource({
    dialect: 'postgres',
    database: 'neondb',
    username: 'neondb_owner',
    password: 'npg_Zt7cFfnyWj5z',
    host: 'ep-fragrant-firefly-a1lz8n2c-pooler.ap-southeast-1.aws.neon.tech',
    port: 5432,
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
    schema: 'public',
    ssl: true,
    models: [Department, CustomUser, Note, Category, Tag, Role, Permission],
  });

  // Initialize controllers
  const userController = new ODataControler({
    model: CustomUser,
    allowedMethod: ['get'],
  });
  const departmentController = new DepartmentController();
  const noteController = new NoteController();
  const categoryController = new CategoryController();
  const tagController = new TagController();
  const roleController = new RoleController();
  const permissionController = new PermissionController();

  new ExpressRouter(app, {
    controllers: [
      userController,
      departmentController,
      noteController,
      categoryController,
      tagController,
      roleController,
      permissionController,
    ],
    dataSource,
    logger: {
      enabled: false,
      logLevel: 'ERROR',
      format: 'JSON',
      advancedOptions: {
        logSqlQuery: false,
        logDbExecutionTime: false,
        logDbQueryParameters: false,
      },
    },
  });
};

export { createSchema };
