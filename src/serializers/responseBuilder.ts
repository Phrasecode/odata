import { Model } from '../core/model';
import { IQueryExecutionResponse } from '../types';

export const parseResponse = <T>(
  data: object[] | { count: number },
  baseModel: typeof Model<T>,
  executionTime: number,
): IQueryExecutionResponse<T> => {
  const formattedData = convertObjectToModel(data, baseModel) as T[];
  let count = 0;
  if (Array.isArray(data)) {
    count = data.length;
  } else {
    count = data.count;
  }
  const response: IQueryExecutionResponse<T> = {
    '@odata.context': `/$metadata#${baseModel.getModelName()}`,
    '@odata.count': count,
    value: formattedData,
    meta: {
      queryExecutionTime: executionTime,
    },
  };

  return response;
};

const convertObjectToModel = <T extends Model<T>>(
  rawObject: any,
  modelClass: typeof Model<any>,
): T | T[] => {
  if (!rawObject) {
    return rawObject;
  }
  if (Array.isArray(rawObject)) {
    return rawObject.map(item => convertSingleObjectToModel(item, modelClass));
  }
  return convertSingleObjectToModel(rawObject, modelClass);
};

const convertSingleObjectToModel = <T extends Model<T>>(
  rawObject: any,
  modelClass: typeof Model<any>,
): T => {
  if (!rawObject) {
    return rawObject;
  }
  const { columnMetadata, relationMetadata } = modelClass.getMetadata();
  const modelInstance: any = {};
  const relations: any = {};
  const objectKeys = Object.keys(rawObject);

  relationMetadata.forEach(relation => {
    const { propertyKey } = relation;
    if (objectKeys.includes(propertyKey)) {
      const model = relation.targetModel;
      const response = convertObjectToModel(rawObject[propertyKey], model);
      relations[propertyKey] = response;

      const index = objectKeys.indexOf(propertyKey);
      objectKeys.splice(index, 1);
    }
  });

  objectKeys.forEach(key => {
    const column = columnMetadata.find(column => {
      if (column.columnIdentifier === key) {
        return column;
      }
      return undefined;
    });

    if (column) {
      modelInstance[column.propertyKey] = rawObject[key];
    }
  });

  return { ...modelInstance, ...relations };
};
