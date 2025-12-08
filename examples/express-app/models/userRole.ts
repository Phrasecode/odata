import { Column, QueryModel, DataTypes, Table } from '../../../src';

@Table({ underscored: true })
export class UserRole extends QueryModel<UserRole> {
  @Column({
    dataType: DataTypes.INTEGER,
    isNullable: false,
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
    dataType: DataTypes.BOOLEAN,
    isNullable: true,
  })
  public isActive!: boolean;

  @Column({
    dataType: DataTypes.DATE,
    isNullable: false,
  })
  public createdAt!: Date;

  @Column({
    dataType: DataTypes.STRING({ length: 100 }),
    isNullable: false,
  })
  public departmentName!: string;

  @Column({
    dataType: DataTypes.STRING({ length: 100 }),
    isNullable: false,
  })
  public roleName!: string;
}
