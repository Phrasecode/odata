import { Model } from '../core/model';
import { MetaData, MetaDataEntity, MetaDataEntityProperty, MetaDataEntityRelation } from '../types';

const generateMetadata = (entityMap: Map<string, typeof Model<any>> = new Map()): MetaData => {
  const entities: MetaDataEntity[] = [];
  // Generate entity metadata
  entityMap.forEach((entity: typeof Model<any>, modelName: string) => {
    const { columnMetadata, relationMetadata } = entity.getMetadata();

    // Build properties array
    const properties: MetaDataEntityProperty[] = [];
    const keys: string[] = [];

    columnMetadata.forEach(col => {
      const property: MetaDataEntityProperty = {
        name: col.propertyKey,
        type: col.dataType.toString({}),
        nullable: col.isNullable !== false,
      };

      // Add optional fields only if they have meaningful values
      if (col.defaultValue !== undefined) {
        property.defaultValue = col.defaultValue;
      }
      if (col.isAutoIncrement) {
        property.autoIncrement = true;
      }
      if (col.isUnique) {
        property.unique = true;
      }
      if (col.isPrimaryKey) {
        property.primaryKey = true;
      }

      properties.push(property);

      if (col.isPrimaryKey) {
        keys.push(col.propertyKey);
      }
    });

    // Build navigation properties array
    const navigationProperties: MetaDataEntityRelation[] = [];

    relationMetadata.forEach(rel => {
      const targetModelName = rel.targetModel.getModelName();
      const isCollection = rel.type === 'hasMany';

      const navProp: MetaDataEntityRelation = {
        name: rel.propertyKey,
        type: isCollection ? `Collection(${targetModelName})` : targetModelName,
      };

      // Add reference information
      if (rel.relation && rel.relation.length > 0) {
        navProp.reference = rel.relation.map(r => ({
          sourceKey: r.sourceKey,
          targetKey: r.targetKey,
        }));
      }

      navigationProperties.push(navProp);
    });

    const entityMetadata: MetaDataEntity = {
      name: modelName,
      keys: keys,
      properties: properties,
    };

    if (navigationProperties.length > 0) {
      entityMetadata.navigationProperties = navigationProperties;
    }

    entities.push(entityMetadata);
  });

  return {
    entities: entities,
  };
};

export { generateMetadata };
