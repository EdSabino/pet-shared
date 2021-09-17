
import { isSuperAdmin } from "../src/index";

describe('@isSuperAdmin', () => {
  
  class Mock {
    callback = jest.fn();

    @isSuperAdmin()
    async test(event: any) {
      this.callback();
    }
  }

  describe('when not superadmin', () => {
    const mock = new Mock();
    const result = { statusCode: 401, body: { success: false, message: 'unauthorized' } };
    const event = {
      requestContext: {
        authorizer: {
          claims: {
            superadmin: false
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
    const event = {
      requestContext: {
        authorizer: {
          claims: {
            superadmin: true
          }
        }
      }
    };

    it('must call callback', () => {
      mock.test(event).then(() => {
        expect(mock.callback.mock.calls.length).toBe(1);
      });
    });
  });
});
