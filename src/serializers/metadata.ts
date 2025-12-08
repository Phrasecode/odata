import { Model } from '../core/model';
import { QueryModel } from '../core/queryModel';
import {
  ControllerEndpointInfo,
  ODataEntityType,
  ODataFunction,
  ODataMetadata,
  ODataNavigationProperty,
  ODataProperty,
} from '../types';

/**
 * Map internal data types to OData Edm types
 */
const mapToEdmType = (internalType: string): string => {
  const typeStr = internalType.toUpperCase();

  // Check BIGINT first before INT
  if (typeStr.includes('BIGINT')) {
    return 'Edm.Int64';
  }
  if (typeStr.includes('INT') || typeStr.includes('INTEGER')) {
    return 'Edm.Int32';
  }
  if (typeStr.includes('SMALLINT') || typeStr.includes('TINYINT')) {
    return 'Edm.Int16';
  }
  if (typeStr.includes('DECIMAL') || typeStr.includes('NUMERIC')) {
    return 'Edm.Decimal';
  }
  if (typeStr.includes('FLOAT') || typeStr.includes('REAL') || typeStr.includes('DOUBLE')) {
    return 'Edm.Double';
  }
  if (typeStr.includes('BOOLEAN') || typeStr.includes('BOOL')) {
    return 'Edm.Boolean';
  }
  if (typeStr.includes('DATE') && !typeStr.includes('TIME')) {
    return 'Edm.Date';
  }
  if (typeStr.includes('DATETIME') || typeStr.includes('TIMESTAMP')) {
    return 'Edm.DateTimeOffset';
  }
  if (typeStr.includes('TIME') && !typeStr.includes('DATE')) {
    return 'Edm.TimeOfDay';
  }
  if (typeStr.includes('UUID') || typeStr.includes('GUID')) {
    return 'Edm.Guid';
  }
  if (typeStr.includes('BLOB') || typeStr.includes('BINARY')) {
    return 'Edm.Binary';
  }
  // Default to String for VARCHAR, TEXT, CHAR, JSON, ENUM, etc.
  return 'Edm.String';
};

/**
 * Check if a model is a QueryModel
 */
const isQueryModel = (model: typeof Model): boolean => {
  return model.prototype instanceof QueryModel;
};

/**
 * Generate OData v4 CSDL+JSON metadata
 */
const generateMetadata = (
  entityMap: Map<string, typeof Model<any>> = new Map(),
  controllerEndpoints: ControllerEndpointInfo[] = [],
  baseUrl?: string,
): ODataMetadata => {
  const entities: Record<string, ODataEntityType> = {};
  const functions: Record<string, ODataFunction> = {};

  // Create endpoint lookup map
  const endpointMap = new Map<string, ControllerEndpointInfo>();
  controllerEndpoints.forEach(info => {
    endpointMap.set(info.modelName, info);
  });

  // Generate entity metadata
  entityMap.forEach((entity: typeof Model<any>, modelName: string) => {
    const { columnMetadata, relationMetadata } = entity.getMetadata();
    const controllerInfo = endpointMap.get(modelName);
    const endpoint = controllerInfo?.endpoint || `/${modelName.toLowerCase()}`;

    // Check if this is a QueryModel
    if (isQueryModel(entity)) {
      // Generate function metadata for QueryModel
      const functionProps: Record<string, { $Type: string; $Nullable?: boolean }> = {};

      columnMetadata.forEach(col => {
        functionProps[col.propertyKey] = {
          $Type: mapToEdmType(col.dataType.toString({})),
          $Nullable: col.isNullable !== false,
        };
      });

      // Add query methods as functions
      if (controllerInfo?.queryMethods) {
        controllerInfo.queryMethods.forEach(method => {
          const functionName = method.methodName;
          functions[functionName] = {
            $Kind: 'QueryModel',
            resultModel: modelName,
            $Endpoint: `${endpoint}${method.endpoint}`,
            properties: functionProps,
          };
        });
      } else {
        // If no query methods, add the model itself as a function
        functions[modelName] = {
          $Kind: 'QueryModel',
          resultModel: modelName,
          $Endpoint: endpoint,
          properties: functionProps,
        };
      }
    } else {
      // Generate entity metadata for regular Model
      const keys: string[] = [];
      const entityType: ODataEntityType = {
        $Kind: 'EntityType',
        $Key: [],
        $Endpoint: endpoint,
      };

      // Add properties
      columnMetadata.forEach(col => {
        const property: ODataProperty = {
          $Kind: 'Property',
          $Type: mapToEdmType(col.dataType.toString({})),
          $Nullable: col.isNullable !== false,
        };

        if (col.defaultValue !== undefined) {
          property.$DefaultValue = col.defaultValue;
        }
        if (col.isAutoIncrement) {
          property.$AutoIncrement = true;
        }

        entityType[col.propertyKey] = property;

        if (col.isPrimaryKey) {
          keys.push(col.propertyKey);
        }
      });

      entityType.$Key = keys;

      // Add navigation properties
      relationMetadata.forEach(rel => {
        const targetModelName = rel.targetModel.getModelName();
        const isCollection = rel.type === 'hasMany';

        const navProp: ODataNavigationProperty = {
          $Kind: 'NavigationProperty',
          $Type: isCollection ? `Collection(${targetModelName})` : targetModelName,
        };

        // Add referential constraint
        if (rel.relation && rel.relation.length > 0) {
          navProp.$ReferentialConstraint = {};
          rel.relation.forEach(r => {
            navProp.$ReferentialConstraint![r.sourceKey] = `${targetModelName}/${r.targetKey}`;
          });
        }

        entityType[rel.propertyKey] = navProp;
      });

      // Add query methods as additional endpoints if present
      if (controllerInfo?.queryMethods) {
        controllerInfo.queryMethods.forEach(method => {
          const functionName = `${modelName}_${method.methodName}`;
          const functionProps: Record<string, { $Type: string; $Nullable?: boolean }> = {};

          columnMetadata.forEach(col => {
            functionProps[col.propertyKey] = {
              $Type: mapToEdmType(col.dataType.toString({})),
              $Nullable: col.isNullable !== false,
            };
          });

          functions[functionName] = {
            $Kind: 'QueryModel',
            resultModel: modelName,
            $Endpoint: `${endpoint}${method.endpoint}`,
            properties: functionProps,
          };
        });
      }

      entities[modelName] = entityType;
    }
  });

  const metadata: ODataMetadata = {
    $Version: '4.0',
    $EntityContainer: 'OData.Container',
    entities,
    metadata: {
      title: 'OData API',
      baseUrl: baseUrl,
      generatedAt: new Date().toISOString(),
      format: 'CSDL+JSON',
      $Endpoint: '/$metadata',
    },
  };

  // Only add functions if there are any
  if (Object.keys(functions).length > 0) {
    metadata.functions = functions;
  }

  return metadata;
};

export { generateMetadata, mapToEdmType };
