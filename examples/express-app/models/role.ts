import { Column, DataTypes, Model, Table } from '../../../src';

@Table({ underscored: true, tableName: 'roles' })
export class Role extends Model<Role> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
  public roleId!: number;

  @Column({
    dataType: DataTypes.STRING({ length: 50 }),
    isNullable: false,
  })
  public roleName!: string;

  @Column({
    dataType: DataTypes.TEXT,
    isNullable: true,
  })
  public description!: string;
}
