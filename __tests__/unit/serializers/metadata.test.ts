import { BelongsTo, Column, DataTypes, HasMany, Model, Table } from '../../../src';
import { generateMetadata } from '../../../src/serializers/metadata';

// Test models
@Table({ tableName: 'test_users', underscored: true })
class TestUser extends Model<TestUser> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
    id!: number;

  @Column({
    dataType: DataTypes.STRING,
    isNullable: false,
  })
    username!: string;

  @Column({
    dataType: DataTypes.STRING,
    isUnique: true,
  })
    email!: string;

  @Column({
    dataType: DataTypes.BOOLEAN,
    defaultValue: true,
  })
    isActive!: boolean;

  @HasMany(() => TestPost, {
    relation: [{ foreignKey: 'userId', sourceKey: 'id' }],
  })
    posts!: TestPost[];
}

@Table({ tableName: 'test_posts', underscored: true })
class TestPost extends Model<TestPost> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
    isAutoIncrement: true,
  })
    id!: number;

  @Column({
    dataType: DataTypes.STRING,
    isNullable: false,
  })
    title!: string;

  @Column({
    dataType: DataTypes.TEXT,
  })
    content!: string;

  @Column({
    dataType: DataTypes.INTEGER,
  })
    userId!: number;

  @BelongsTo(() => TestUser, {
    relation: [{ foreignKey: 'id', sourceKey: 'userId' }],
  })
    user!: TestUser;
}

@Table({ tableName: 'simple_tags' })
class SimpleTag extends Model<SimpleTag> {
  @Column({
    dataType: DataTypes.INTEGER,
    isPrimaryKey: true,
  })
    tagId!: number;

  @Column({
    dataType: DataTypes.STRING,
  })
    tagName!: string;
}

describe('generateMetadata', () => {
  describe('Basic metadata generation', () => {
    it('should generate metadata for empty entity map', () => {
      const result = generateMetadata(new Map());
      expect(result).toEqual({
        entities: [],
      });
    });

    it('should generate metadata for single entity without relations', () => {
      const entityMap = new Map();
      entityMap.set('SimpleTag', SimpleTag);

      const result = generateMetadata(entityMap);

      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('SimpleTag');
      expect(result.entities[0].keys).toEqual(['tagId']);
      expect(result.entities[0].properties).toHaveLength(2);
    });

    it('should generate correct property metadata', () => {
      const entityMap = new Map();
      entityMap.set('SimpleTag', SimpleTag);

      const result = generateMetadata(entityMap);
      const entity = result.entities[0];

      const tagIdProp = entity.properties.find(p => p.name === 'tagId');
      expect(tagIdProp).toMatchObject({
        name: 'tagId',
        type: expect.any(String),
        nullable: true,
        primaryKey: true,
      });

      const tagNameProp = entity.properties.find(p => p.name === 'tagName');
      expect(tagNameProp).toMatchObject({
        name: 'tagName',
        type: expect.any(String),
        nullable: true,
      });
    });
  });

  describe('Property attributes', () => {
    it('should include autoIncrement flag when set', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);

      const result = generateMetadata(entityMap);
      const entity = result.entities[0];
      const idProp = entity.properties.find(p => p.name === 'id');

      expect(idProp?.autoIncrement).toBe(true);
    });

    it('should include unique flag when set', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);

      const result = generateMetadata(entityMap);
      const entity = result.entities[0];
      const emailProp = entity.properties.find(p => p.name === 'email');

      expect(emailProp?.unique).toBe(true);
    });

    it('should include defaultValue when set', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);

      const result = generateMetadata(entityMap);
      const entity = result.entities[0];
      const isActiveProp = entity.properties.find(p => p.name === 'isActive');

      expect(isActiveProp?.defaultValue).toBe(true);
    });

    it('should set nullable correctly', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);

      const result = generateMetadata(entityMap);
      const entity = result.entities[0];
      const usernameProp = entity.properties.find(p => p.name === 'username');

      expect(usernameProp?.nullable).toBe(false);
    });
  });

  describe('Navigation properties', () => {
    it('should generate navigation properties for hasMany relations', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);
      entityMap.set('TestPost', TestPost);

      const result = generateMetadata(entityMap);
      const userEntity = result.entities.find(e => e.name === 'TestUser');

      expect(userEntity?.navigationProperties).toBeDefined();
      expect(userEntity?.navigationProperties).toHaveLength(1);
      expect(userEntity?.navigationProperties![0]).toMatchObject({
        name: 'posts',
        type: 'Collection(TestPost)',
      });
    });

    it('should generate navigation properties for belongsTo relations', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);
      entityMap.set('TestPost', TestPost);

      const result = generateMetadata(entityMap);
      const postEntity = result.entities.find(e => e.name === 'TestPost');

      expect(postEntity?.navigationProperties).toBeDefined();
      expect(postEntity?.navigationProperties).toHaveLength(1);
      expect(postEntity?.navigationProperties![0]).toMatchObject({
        name: 'user',
        type: 'TestUser',
      });
    });

    it('should include reference information in navigation properties', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);
      entityMap.set('TestPost', TestPost);

      const result = generateMetadata(entityMap);
      const userEntity = result.entities.find(e => e.name === 'TestUser');
      const navProp = userEntity?.navigationProperties![0];

      expect(navProp?.reference).toBeDefined();
      expect(navProp?.reference).toHaveLength(1);
      expect(navProp?.reference![0]).toMatchObject({
        sourceKey: 'id',
        targetKey: 'userId',
      });
    });

    it('should not include navigationProperties if entity has no relations', () => {
      const entityMap = new Map();
      entityMap.set('SimpleTag', SimpleTag);

      const result = generateMetadata(entityMap);
      const entity = result.entities[0];

      expect(entity.navigationProperties).toBeUndefined();
    });
  });

  describe('Multiple entities', () => {
    it('should generate metadata for multiple entities', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);
      entityMap.set('TestPost', TestPost);
      entityMap.set('SimpleTag', SimpleTag);

      const result = generateMetadata(entityMap);

      expect(result.entities).toHaveLength(3);
      expect(result.entities.map(e => e.name)).toContain('TestUser');
      expect(result.entities.map(e => e.name)).toContain('TestPost');
      expect(result.entities.map(e => e.name)).toContain('SimpleTag');
    });

    it('should generate correct keys for each entity', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);
      entityMap.set('TestPost', TestPost);

      const result = generateMetadata(entityMap);

      const userEntity = result.entities.find(e => e.name === 'TestUser');
      const postEntity = result.entities.find(e => e.name === 'TestPost');

      expect(userEntity?.keys).toEqual(['id']);
      expect(postEntity?.keys).toEqual(['id']);
    });
  });
});
