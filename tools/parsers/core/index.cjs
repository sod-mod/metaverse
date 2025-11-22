/**
 * Core Parser Infrastructure
 * @module parsers/core
 */

module.exports = {
  C2ArrayParser: require('./C2ArrayParser.cjs'),
  FieldMapper: require('./FieldMapper.cjs'),
  TypeConverter: require('./TypeConverter.cjs'),
  RelationResolver: require('./RelationResolver.cjs'),
  LanguageParser: require('./LanguageParser.cjs').LanguageParser
};

