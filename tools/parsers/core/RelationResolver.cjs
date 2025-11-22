/**
 * Relation Resolver
 * Resolves cross-references between data files
 */

class RelationResolver {
  constructor() {
    this.dataCache = {};
    this.resolvers = {};
  }

  /**
   * Register a data source
   */
  registerData(key, data) {
    this.dataCache[key] = Array.isArray(data) ? data : [data];
  }

  /**
   * Register a custom resolver function
   */
  registerResolver(fromType, toType, resolverFn) {
    const key = `${fromType}->${toType}`;
    this.resolvers[key] = resolverFn;
  }

  /**
   * Resolve ID to object
   */
  resolve(id, dataType) {
    const data = this.dataCache[dataType];
    
    if (!data) {
      return null;
    }
    
    return data.find(item => item.id === id) || null;
  }

  /**
   * Resolve multiple IDs
   */
  resolveMany(ids, dataType) {
    if (!Array.isArray(ids)) {
      ids = [ids];
    }
    
    return ids
      .map(id => this.resolve(id, dataType))
      .filter(item => item !== null);
  }

  /**
   * Resolve with custom resolver
   */
  resolveCustom(value, fromType, toType) {
    const key = `${fromType}->${toType}`;
    const resolver = this.resolvers[key];
    
    if (!resolver) {
      throw new Error(`No resolver registered for ${key}`);
    }
    
    return resolver(value, this);
  }

  /**
   * Validate reference exists
   */
  validateReference(id, dataType, fieldName) {
    if (id === 0 || id === null || id === undefined) {
      return true; // Allow empty references
    }
    
    const resolved = this.resolve(id, dataType);
    
    if (!resolved) {
      throw new Error(`Invalid reference ${fieldName}=${id} to ${dataType}`);
    }
    
    return true;
  }

  /**
   * Build index for fast lookups
   */
  buildIndex(dataType, keyField = 'id') {
    const data = this.dataCache[dataType];
    
    if (!data) {
      return {};
    }
    
    const index = {};
    data.forEach(item => {
      const key = item[keyField];
      if (key !== undefined) {
        index[key] = item;
      }
    });
    
    this.dataCache[`${dataType}_index_${keyField}`] = index;
    return index;
  }

  /**
   * Lookup by indexed field
   */
  lookupBy(dataType, keyField, value) {
    const indexKey = `${dataType}_index_${keyField}`;
    let index = this.dataCache[indexKey];
    
    if (!index) {
      index = this.buildIndex(dataType, keyField);
    }
    
    return index[value] || null;
  }

  /**
   * Get all data of type
   */
  getAll(dataType) {
    return this.dataCache[dataType] || [];
  }

  /**
   * Clear cache
   */
  clear() {
    this.dataCache = {};
    this.resolvers = {};
  }
}

module.exports = RelationResolver;

