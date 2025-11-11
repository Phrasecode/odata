import { BelongsTo, Column, DataTypes, Model, Table } from '../../../src';
import type { Category } from './category';
import type { CustomUser } from './user';

@Table({ underscored: true, tableName: 'notes' })
export class Note extends Model<Note> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
  public noteId!: number;

  @Column({
    dataType: DataTypes.INTEGER,
    isNullable: false,
  })
  public userId!: number;

  @BelongsTo(() => require('./user').CustomUser, {
    relation: [
      {
        foreignKey: 'userId',
        sourceKey: 'userId',
      },
    ],
  })
  public user!: CustomUser;

  @Column({
    dataType: DataTypes.INTEGER,
    isNullable: true,
  })
  public categoryId!: number;

  @BelongsTo(() => require('./category').Category, {
    relation: [
      {
        foreignKey: 'categoryId',
        sourceKey: 'categoryId',
      },
    ],
  })
  public category!: Category;

  @Column({
    dataType: DataTypes.STRING({ length: 200 }),
    isNullable: false,
  })
  public title!: string;

  @Column({
    dataType: DataTypes.TEXT,
    isNullable: false,
  })
  public content!: string;

  @Column({
    dataType: DataTypes.BOOLEAN,
    isNullable: true,
  })
  public isPinned!: boolean;

  @Column({
    dataType: DataTypes.BOOLEAN,
    isNullable: true,
  })
  public isArchived!: boolean;

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
}
