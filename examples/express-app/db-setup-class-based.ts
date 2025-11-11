import { Express } from 'express';
import { DataSource, ExpressRouter } from '../../src';
import {
  CategoryController,
  DepartmentController,
  NoteController,
  PermissionController,
  RoleController,
  TagController,
  UserController,
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
    dialect: 'sqlite',
    database: dbPath,
    username: '',
    password: '',
    host: '',
    port: 0,
    pool: {
      max: 1,
      min: 1,
      idle: 10000,
    },
    schema: '', // SQLite doesn't support schemas
    models: [Department, CustomUser, Note, Category, Tag, Role, Permission],
  });

  // Initialize controllers
  const userController = new UserController();
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
      enabled: true,
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
