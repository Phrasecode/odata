import { BelongsTo, Column, DataTypes, HasMany, Model, Table } from '../../../src';
import type { Category } from './category';
import { Department } from './department';
import type { Note } from './note';

@Table({ underscored: true, tableName: 'users' })
export class CustomUser extends Model<CustomUser> {
  @Column({
    dataType: DataTypes.INTEGER,
    isNullable: true,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
  public userId!: number;

  @Column({
    dataType: DataTypes.STRING({ length: 50 }),
    isNullable: false,
  })
  public username!: string;

  @Column({
    dataType: DataTypes.STRING({ length: 100 }),
    isNullable: false,
  })
  public email!: string;

  @Column({
    dataType: DataTypes.TEXT,
    isNullable: false,
  })
  public passwordHash!: string;

  @Column({
    dataType: DataTypes.STRING({ length: 100 }),
    isNullable: true,
  })
  public fullName!: string;

  @Column({
    dataType: DataTypes.INTEGER,
    isNullable: true,
  })
  public departmentId!: number;

  @BelongsTo(() => Department, {
    relation: [
      {
        foreignKey: 'id',
        sourceKey: 'departmentId',
      },
    ],
  })
  public myDepartment!: Department;

  @Column({
    dataType: DataTypes.BOOLEAN,
    isNullable: true,
  })
  public isActive!: boolean;

  @Column({
    dataType: DataTypes.DATE,
    isNullable: true,
  })
  public createdAt!: Date;

  @Column({
    dataType: DataTypes.DATE,
    isNullable: true,
  })
  public updatedAt!: Date;

  @HasMany(() => require('./note').Note, {
    relation: [{ foreignKey: 'userId', sourceKey: 'userId' }],
  })
  public notes!: Note[];

  @HasMany(() => require('./category').Category, {
    relation: [{ foreignKey: 'createdBy', sourceKey: 'userId' }],
  })
  public categories!: Category[];
}
