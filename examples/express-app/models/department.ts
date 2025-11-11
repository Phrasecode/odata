import { Column, DataTypes, HasMany, Model, Table } from '../../../src';
import type { CustomUser } from './user';

@Table({ underscored: true, tableName: 'departments' })
export class Department extends Model<Department> {
  @Column({
    dataType: DataTypes.INTEGER,
    isNullable: true,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
  public id!: number;

  @Column({
    dataType: DataTypes.STRING({ length: 100 }),
    isNullable: false,
  })
  public departmentName!: string;

  @Column({
    dataType: DataTypes.TEXT,
    isNullable: true,
  })
  public description!: string;

  @Column({
    dataType: DataTypes.DATE,
    isNullable: true,
  })
  public createdAt!: Date;

  @HasMany(() => require('./user').CustomUser, {
    relation: [{ foreignKey: 'departmentId', sourceKey: 'id' }],
  })
  public users!: CustomUser[];
}
