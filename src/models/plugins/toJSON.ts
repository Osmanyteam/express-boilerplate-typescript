'use strict';

import _ from 'lodash';
import { Schema } from 'mongoose';

const utils = require('./utils');

export const toJSON = function (schema: Schema, options: any) {
  options = _.merge({ omit: [], pick: [] }, options);
  const privatePaths = utils.getPaths(schema, options);
  utils.updatePaths(privatePaths, options);

  const toJSON = schema.methods.toJSON;

  const omitPrivatePaths = function (doc: { toObject: any }, options: any /*, ...*/) {
    // eslint-disable-next-line prefer-rest-params
    const args = Array.prototype.slice.call(arguments, 1);
    const obj = (
      toJSON ||
      doc.toObject ||
      function () {
        return this;
      }
    ).apply(doc, args);

    const _paths = utils.updatePaths(privatePaths, options);

    // omit all private paths
    return utils.nestedOmit(obj, _paths);
  };

  function toProjection(options: {}) {
    const _paths = utils.updatePaths(privatePaths, options);
    return _.flatten(utils.toProjection(_paths)).join(' ');
  }

  schema.methods.toJSON = function toJsonWrapper(/*options, ...*/) {
    // eslint-disable-next-line prefer-rest-params
    const args = Array.prototype.concat.apply(this, arguments);
    return omitPrivatePaths.apply(this.constructor, args);
  };
  schema.statics.omitPrivatePaths = omitPrivatePaths;
  schema.statics.toProjection = toProjection;
  (schema as any)._privatePaths = toProjection({});
};
