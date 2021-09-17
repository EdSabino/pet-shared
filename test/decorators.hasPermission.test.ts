
import { hasPermission } from "../src/index";

describe('@hasPermission', () => {
  class Mock {
    callback = jest.fn();

    @hasPermission('permission', 'pathParameters.establishment_id')
    async test(event: any) {
      this.callback();
    }
  }

  describe('when does not have permission', () => {
    const mock = new Mock();
    const result = { statusCode: 401, body: { success: false, message: 'unauthorized' } };
    const event = {
      pathParameters: {
        establishment_id: 'est'
      },
      requestContext: {
        authorizer: {
          claims: {
            superadmin: false,
            permissions: {}
          }
        }
      }
    };

    it('must return 401', async () => {
      await expect(async () => mock.test(event)).rejects.toEqual(result);
    });
    
    it('must not call callback', () => {
      mock.test(event).catch(() => {
        expect(mock.callback.mock.calls.length).toBe(0);
      });
    });
  });

  describe('when is superadmin', () => {
    const mock = new Mock();
    const validEvent = {
      pathParameters: {
        establishment_id: 'est'
      },
      requestContext: {
        authorizer: {
          claims: {
            superadmin: true,
            permissions: {}
          }
        }
      }
    };

    it('must call callback', () => {
      mock.test(validEvent).then(() => {
        expect(mock.callback.mock.calls.length).toBe(1);
      });
    });
  });

  describe('when hasPermission', () => {
    const mock = new Mock();
    const validEvent = {
      pathParameters: {
        establishment_id: 'est'
      },
      requestContext: {
        authorizer: {
          claims: {
            superadmin: false,
            permissions: {
              est: ['permission']
            }
          }
        }
      }
    };

    it('must call callback', () => {
      mock.test(validEvent).then(() => {
        expect(mock.callback.mock.calls.length).toBe(1);
      });
    });
  });
});
