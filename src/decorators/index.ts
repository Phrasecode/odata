export * from './column.decorator';
export * from './query.decorator';
export * from './relation.decorator';
export * from './table.decorator';

// Backward compatibility aliases
export { Query as Custom, getQueryMethods as getCustomMethods } from './query.decorator';
