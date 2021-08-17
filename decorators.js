"use strict";
const { validationError } = require('./validation_error');

function parseUser(func) {
  return async (args) => {
    args.requestContext.authorizer.claims = JSON.parse(args.requestContext.authorizer.stringKey);
    return func(args);
  };
}

function database(func, mongoose) {
  return async (args) => {
    console.log('Mongo trying');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Mongo connected');
    return func(args);
  };
}

function handler (UseCase, success, failure) {
  return async (event) => {
    try {
      const res = await UseCase.execute(event);
      return {
        statusCode: success,
        body: JSON.stringify(res),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        }
      }
    } catch (err) {
      return {
        statusCode: failure,
        body: JSON.stringify(err),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        }
      }
    }
  }
}

function isSuperAdmin(func) {
  return async (event) => {
    console.log(event.requestContext.authorizer)
    if (event.requestContext.authorizer.claims.superadmin) {
      return await func(event);
    }

    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, message: 'unauthorized' })
    }
  };
}

function hasPermission(func, permission, field) {
  return async (event) => {
    const user = event.requestContext.authorizer.claims;
    const permissions = user.permissions[resolve(field, event)];
    if (user.superadmin || (permissions && permissions.find(perm => perm === permission))) {
      return await func(event);
    }

    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, message: 'unauthorized' })
    }
  };
}

const returnBody = body => body;

function defaultCreate(Model, prepare = returnBody) {
  return {
    execute: async ({ body, requestContext }) => {
      try {
        const result = await Model.create(await prepare(JSON.parse(body), requestContext));
        return { success: true, _id: result._id.toString() };
      } catch (e) {
        if (e.errors) {
          throw validationError(e);
        } else if (typeof e === 'object') {
          throw e;
        } else {
          throw { success: false, message: 'unknown_error' };
        }
      }
    }
  }
}

function defaultUpdate(Model, name, prepare = returnBody) {
  return {
    execute: async ({ body, pathParameters }) => {
      try {
        const result = await Model.updateOne({ _id: pathParameters._id }, prepare(JSON.parse(body), pathParameters));
        if (result.ok == 0) {
          throw { success: false, message: `${name}_not_found` };
        }
        return { success: true, _id: pathParameters._id };
      } catch (e) {
        console.log(e)
        if (e.errors) {
          throw validationError(e);
        } else {
          throw { success: false, message: 'unknown_error' };
        }
      }
    }
  }
}

function defaultList(Model, name) {
  return {
    execute: async ({ queryStringParameters: { page, size } }) => {
      try {
        const docs = await Model.find({}, Model.publicFields(), { limit: parseInt(size), skip: page*10 });
        const count = await Model.countDocuments({}, (err, count) => new Promise((resolve, reject) => {
          if (err) {
            reject(err);
          }

          resolve(count);
        }));
        return { success: true, docs, paginate: { page: parseInt(page), count, size }};
      } catch (e) {
        console.log(e);
        throw { success: false, message: `${name}_not_found` };
      }
    }
  }
}

function defaultGet(Model, name) {
  return {
    execute: async ({ pathParameters }) => {
      const result = await Model.findOne({ _id: pathParameters._id }, Model.publicFields());
      if (!result) {
        throw { success: false, message: `${name}_not_found` };
      }
      const base = { success: true };
      base[name] = result;
      return base;
    }
  }
}

function resolve(path, obj) {
  var properties = Array.isArray(path) ? path : path.split('.')
  return properties.reduce((prev, curr) => prev && prev[curr], obj)
}

module.exports = {
  database,
  handler,
  isSuperAdmin,
  hasPermission,
  defaultCreate,
  defaultUpdate,
  defaultList,
  defaultGet,
  parseUser
}
