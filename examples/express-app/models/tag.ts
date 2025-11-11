import { Column, DataTypes, Model, Table } from '../../../src';

@Table({ underscored: true, tableName: 'tags' })
export class Tag extends Model<Tag> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
  public tagId!: number;

  @Column({
    dataType: DataTypes.STRING({ length: 50 }),
    isNullable: false,
  })
  public tagName!: string;
}
