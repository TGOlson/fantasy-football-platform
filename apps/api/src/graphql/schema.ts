import { builder } from './builder';

// Import all schema files
import './schema/user';
import './schema/league';

// Build and export the schema
export const schema = builder.toSchema();
