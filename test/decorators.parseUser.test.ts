import { parseUser } from "../src/index";

describe('@parseUser', () => {
  describe('must parse stringKey', () => {
    const event = {
      requestContext: {
        authorizer: {
          stringKey: '{\"user\": true}'
        }
      }  
    }

    class Mock {
      @parseUser()
      test(event: any) {
        return event.requestContext.authorizer.claims;
      }
    }

    const mock = new Mock();

    it('must return claims', async () => {
      expect(await mock.test(event)).toEqual({
        user: true
      });
    });
  });
});
