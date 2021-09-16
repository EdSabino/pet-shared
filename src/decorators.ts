function validationError(err: any) {
  const fields: any = {};
  const errors = Object.keys(err.errors);
  const messages = errors.map((e: string) => { fields[e] = err.errors[e].properties.message; return fields[e]} );
  throw { statusCode: 422, body: { success: false, message: messages.join(', '), error_fields: fields }};
}

function resolve(path: any, obj: any) {
  var properties = Array.isArray(path) ? path : path.split('.')
  return properties.reduce((prev: any, curr: any, _: number, __: any[]) => prev && prev[curr], obj)
}

export function database() {
  return (_: any, __: string | symbol, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      console.log('Mongo trying');
      await this.mongooseService.connect(process.env.MONGO_URI);
      console.log('Mongo connected');

      return originalMethod.apply(this, args);
    }
    return descriptor;
  };
}


export function isSuperAdmin() {
  return (_: any, __: string | symbol, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (event: any, context: any) {
      if (event.requestContext.authorizer.claims.superadmin) {
        return originalMethod.apply(this, [event, context]);
      }

      throw {
        statusCode: 401,
        body: { success: false, message: 'unauthorized' }
      }
    }
    return descriptor;
  };
}

export function hasPermission(permission: string, field: string) {
  return (_: any, __: string | symbol, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (event: any, context: any) {
      const user = event.requestContext.authorizer.claims;
      const permissions = user.permissions[resolve(field, event)];
      if (user.superadmin || (permissions && permissions.find((perm: string) => perm === permission))) {
        return originalMethod.apply(this, [event, context]);
      }

      return {
        statusCode: 401,
        body: { success: false, message: 'unauthorized' }
      }
    }
    return descriptor;
  };
}
export function wrapper () {
  return (_: any, __: string | symbol, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (event: any, context: any) {
      try {
        const result = await originalMethod.apply(this, [event, context]);

        return {
          statusCode: result.statusCode,
          body: JSON.stringify(result.body),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          }
        }
      } catch (e: any) {
        console.log(e)
        return {
          statusCode: e.statusCode || 500,
          body: JSON.stringify(e.body || { success: false, message: 'unkown_error'}),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          }
        }
      }
    }
    return descriptor;
  };
}

export function parseUser() {
  return (_: any, __: string | symbol, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (event: any, context: any) {
      event.requestContext.authorizer.claims = JSON.parse(event.requestContext.authorizer.stringKey);
      return originalMethod.apply(this, [event, context]);
    };

    return descriptor;
  };
}

export function defaultCreate(hasFunction: boolean) {
  return (_: any, __: string | symbol, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (event: any, context: any) {
      try {
        const body = hasFunction ? await originalMethod.apply(this, [event, context]) : JSON.parse(event.body);
        const result = await this.model.create(body);
        return { 
          statusCode: 201,
          body: {
            success: true, _id: result._id.toString()
          }
        };
      } catch (e: any) {
        if (e.errors) {
          validationError(e);
        } else if (typeof e === 'object') {
          throw e;
        } else {
          throw {};
        }
      }
    }
    return descriptor;
  };
}

export function defaultUpdate(hasFunction: boolean, name: string) {
  return (_: any, __: string | symbol, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (event: any, context: any) {
      try {
        const body = hasFunction ? await originalMethod.apply(this, [event, context]) : JSON.parse(event.body);
        const result = await this.model.updateOne({ _id: event.pathParameters._id }, {
          $set: body
        });
        if (result.ok == 0) {
          throw {
            statusCode: 404,
            body: { success: false, message: `${name}_not_found` }
          };
        }
        return {
          statusCode: 200,
          body: {
            success: true, _id: event.pathParameters._id
          }
        };
      } catch (e: any) {
        if (e.errors) {
          throw validationError(e);
        } else if (typeof e === 'object') {
          throw e;
        } else {
          throw {};
        }
      }
    }
    return descriptor;
  };
}

export function defaultGet(name: string) {
  return (_: any, __: string | symbol, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (event: any, context: any) {
      await originalMethod.apply(this, [event, context]);
      const result = await this.model.findOne({ _id: event.pathParameters._id }, this.model.publicFields());
      if (!result) {
        throw {
          statusCode: 404,
          body: { success: false, message: `${name}_not_found` }
        };
      }
      const body = { success: true, [name]: result };
      return {
        statusCode: 200,
        body
      }
    }
    return descriptor;
  };
}

export function defaultList(name: string) {
  return (_: any, __: string | symbol, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (event: any, context: any) {
      const { queryStringParameters: { page, size } } = event;
      try {
        await originalMethod.apply(this, [event, context]);
        const docs = await this.model.find({}, this.model.publicFields(), { limit: parseInt(size), skip: page*10 });
        const count = await this.model.countDocuments({}, (err: any, count: number) => new Promise((resolve, reject) => {
          if (err) {
            reject(err);
          }

          resolve(count);
        }));
        return {
          statusCode: 200,
          body: {success: true, docs, paginate: { page: parseInt(page), count, size } }
        };
      } catch (e) {
        throw {
          statusCode: 404,
          body: { success: false, message: `${name}_not_found` }
        };
      }
    }
    return descriptor;
  };
}
