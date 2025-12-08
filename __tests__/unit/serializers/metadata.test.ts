import { BelongsTo, Column, DataTypes, HasMany, Model, Table } from '../../../src';
import { generateMetadata, mapToEdmType } from '../../../src/serializers/metadata';

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
  describe('OData v4 CSDL+JSON format', () => {
    it('should generate metadata with correct version and container', () => {
      const entityMap = new Map();
      entityMap.set('SimpleTag', SimpleTag);

      const result = generateMetadata(entityMap);

      expect(result.$Version).toBe('4.0');
      expect(result.$EntityContainer).toBe('OData.Container');
      expect(result.metadata).toBeDefined();
      expect(result.metadata.format).toBe('CSDL+JSON');
      expect(result.metadata.$Endpoint).toBe('/$metadata');
    });

    it('should generate metadata info section', () => {
      const entityMap = new Map();
      entityMap.set('SimpleTag', SimpleTag);

      const result = generateMetadata(entityMap, [], 'http://localhost:3000');

      expect(result.metadata.title).toBe('OData API');
      expect(result.metadata.baseUrl).toBe('http://localhost:3000');
      expect(result.metadata.generatedAt).toBeDefined();
    });
  });

  describe('Entity generation', () => {
    it('should generate entity with correct structure', () => {
      const entityMap = new Map();
      entityMap.set('SimpleTag', SimpleTag);

      const result = generateMetadata(entityMap);

      expect(result.entities.SimpleTag).toBeDefined();
      expect(result.entities.SimpleTag.$Kind).toBe('EntityType');
      expect(result.entities.SimpleTag.$Key).toEqual(['tagId']);
      expect(result.entities.SimpleTag.$Endpoint).toBe('/simpletag');
    });

    it('should use custom endpoint from controller info', () => {
      const entityMap = new Map();
      entityMap.set('SimpleTag', SimpleTag);

      const result = generateMetadata(entityMap, [
        { modelName: 'SimpleTag', endpoint: '/tags', isQueryModel: false },
      ]);

      expect(result.entities.SimpleTag.$Endpoint).toBe('/tags');
    });
  });

  describe('Property generation', () => {
    it('should generate properties with OData types', () => {
      const entityMap = new Map();
      entityMap.set('SimpleTag', SimpleTag);

      const result = generateMetadata(entityMap);
      const entity = result.entities.SimpleTag;

      expect(entity.tagId).toMatchObject({
        $Kind: 'Property',
        $Type: 'Edm.Int32',
        $Nullable: true,
      });

      expect(entity.tagName).toMatchObject({
        $Kind: 'Property',
        $Type: 'Edm.String',
        $Nullable: true,
      });
    });

    it('should include $AutoIncrement when set', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);

      const result = generateMetadata(entityMap);
      const entity = result.entities.TestUser;
      const idProp = entity.id as any;

      expect(idProp.$AutoIncrement).toBe(true);
    });

    it('should include $DefaultValue when set', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);

      const result = generateMetadata(entityMap);
      const entity = result.entities.TestUser;
      const isActiveProp = entity.isActive as any;

      expect(isActiveProp.$DefaultValue).toBe(true);
    });

    it('should set $Nullable correctly', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);

      const result = generateMetadata(entityMap);
      const entity = result.entities.TestUser;
      const usernameProp = entity.username as any;

      expect(usernameProp.$Nullable).toBe(false);
    });
  });

  describe('Navigation properties', () => {
    it('should generate navigation properties for hasMany relations', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);
      entityMap.set('TestPost', TestPost);

      const result = generateMetadata(entityMap);
      const userEntity = result.entities.TestUser;

      expect(userEntity.posts).toMatchObject({
        $Kind: 'NavigationProperty',
        $Type: 'Collection(TestPost)',
      });
    });

    it('should generate navigation properties for belongsTo relations', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);
      entityMap.set('TestPost', TestPost);

      const result = generateMetadata(entityMap);
      const postEntity = result.entities.TestPost;

      expect(postEntity.user).toMatchObject({
        $Kind: 'NavigationProperty',
        $Type: 'TestUser',
      });
    });

    it('should include $ReferentialConstraint in navigation properties', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);
      entityMap.set('TestPost', TestPost);

      const result = generateMetadata(entityMap);
      const userEntity = result.entities.TestUser;
      const postsNav = userEntity.posts as any;

      expect(postsNav.$ReferentialConstraint).toBeDefined();
      expect(postsNav.$ReferentialConstraint.id).toBe('TestPost/userId');
    });
  });

  describe('Multiple entities', () => {
    it('should generate metadata for multiple entities', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);
      entityMap.set('TestPost', TestPost);
      entityMap.set('SimpleTag', SimpleTag);

      const result = generateMetadata(entityMap);

      expect(Object.keys(result.entities)).toHaveLength(3);
      expect(result.entities.TestUser).toBeDefined();
      expect(result.entities.TestPost).toBeDefined();
      expect(result.entities.SimpleTag).toBeDefined();
    });
  });

  describe('Query methods as functions', () => {
    it('should add query methods to functions section', () => {
      const entityMap = new Map();
      entityMap.set('TestUser', TestUser);

      const result = generateMetadata(entityMap, [
        {
          modelName: 'TestUser',
          endpoint: '/user',
          isQueryModel: false,
          queryMethods: [{ methodName: 'getActiveUsers', endpoint: '/active', httpMethod: 'get' }],
        },
      ]);

      expect(result.functions).toBeDefined();
      expect(result.functions!.TestUser_getActiveUsers).toBeDefined();
      expect(result.functions!.TestUser_getActiveUsers.$Kind).toBe('QueryModel');
      expect(result.functions!.TestUser_getActiveUsers.$Endpoint).toBe('/user/active');
    });
  });
});

describe('mapToEdmType', () => {
  it('should map INTEGER to Edm.Int32', () => {
    expect(mapToEdmType('INTEGER')).toBe('Edm.Int32');
    expect(mapToEdmType('INT')).toBe('Edm.Int32');
  });

  it('should map BIGINT to Edm.Int64', () => {
    expect(mapToEdmType('BIGINT')).toBe('Edm.Int64');
  });

  it('should map DECIMAL to Edm.Decimal', () => {
    expect(mapToEdmType('DECIMAL')).toBe('Edm.Decimal');
    expect(mapToEdmType('NUMERIC')).toBe('Edm.Decimal');
  });

  it('should map BOOLEAN to Edm.Boolean', () => {
    expect(mapToEdmType('BOOLEAN')).toBe('Edm.Boolean');
    expect(mapToEdmType('BOOL')).toBe('Edm.Boolean');
  });

  it('should map DATE to Edm.Date', () => {
    expect(mapToEdmType('DATE')).toBe('Edm.Date');
  });

  it('should map DATETIME to Edm.DateTimeOffset', () => {
    expect(mapToEdmType('DATETIME')).toBe('Edm.DateTimeOffset');
    expect(mapToEdmType('TIMESTAMP')).toBe('Edm.DateTimeOffset');
  });

  it('should map VARCHAR/TEXT to Edm.String', () => {
    expect(mapToEdmType('VARCHAR(255)')).toBe('Edm.String');
    expect(mapToEdmType('TEXT')).toBe('Edm.String');
    expect(mapToEdmType('CHAR')).toBe('Edm.String');
  });

  it('should map FLOAT/DOUBLE to Edm.Double', () => {
    expect(mapToEdmType('FLOAT')).toBe('Edm.Double');
    expect(mapToEdmType('DOUBLE')).toBe('Edm.Double');
    expect(mapToEdmType('REAL')).toBe('Edm.Double');
  });
});
