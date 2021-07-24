"use strict";

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
        body: JSON.stringify(res)
      }
    } catch (err) {
      return {
        statusCode: failure,
        body: JSON.stringify(err)
      }
    }
  }
}

function isSuperAdmin(func) {
  return async (event) => {
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

function resolve(path, obj) {
  var properties = Array.isArray(path) ? path : path.split('.')
  return properties.reduce((prev, curr) => prev && prev[curr], obj)
}


module.exports = {
  database,
  handler,
  isSuperAdmin,
  hasPermission
}
