import {
  Model,
  ModelAttributes,
  ModelStatic,
  DataType as SequelizeDataTypeInterface,
  DataTypes as SequelizeDataTypes,
} from 'sequelize';

type SequelizeModelController = ModelStatic<Model<any, any>>;

export {
  ModelAttributes,
  ModelStatic,
  SequelizeDataTypeInterface,
  SequelizeDataTypes,
  SequelizeModelController,
};
