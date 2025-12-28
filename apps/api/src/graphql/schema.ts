import { builder } from './builder';

// Import all schema files
import './schema/user';

// Build and export the schema
export const schema = builder.toSchema();
