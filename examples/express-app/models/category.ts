import { BelongsTo, Column, DataTypes, HasMany, Model, Table } from '../../../src';
import type { Note } from './note';
import type { CustomUser } from './user';

@Table({ underscored: true, tableName: 'categories' })
export class Category extends Model<Category> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
  public categoryId!: number;

  @Column({
    dataType: DataTypes.STRING({ length: 100 }),
    isNullable: false,
  })
  public categoryName!: string;

  @Column({
    dataType: DataTypes.TEXT,
    isNullable: true,
  })
  public description!: string;

  @Column({
    dataType: DataTypes.INTEGER,
    isNullable: true,
  })
  public createdBy!: number;

  @BelongsTo(() => require('./user').CustomUser, {
    relation: [
      {
        foreignKey: 'userId',
        sourceKey: 'createdBy',
      },
    ],
  })
  public creator!: CustomUser;

  @Column({
    dataType: DataTypes.DATE,
    isNullable: true,
  })
  public createdAt!: Date;

  @HasMany(() => require('./note').Note, {
    relation: [{ foreignKey: 'categoryId', sourceKey: 'categoryId' }],
  })
  public notes!: Note[];
}
