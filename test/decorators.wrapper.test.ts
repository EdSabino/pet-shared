
import { wrapper } from "../src/index";

describe('@wrapper', () => {
  describe('must return success', () => {
    const successBody = {
      statusCode: 200,
      body: { something: true }
    };

    class Mock {
      @wrapper()
      test() {
        return successBody;
      }
    }

    const mock = new Mock();

    it('must return formatted answer', async () => {
      expect(await mock.test()).toEqual({
        statusCode: 200,
        body: "{\"something\":true}",
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        }
      });
    });
  });

  describe('when throws random error', () => {
    class Mock {
      @wrapper()
      test() {
        throw {};
      }
    }

    const mock = new Mock();

    it('must return formatted answer', async () => {
      expect(await mock.test()).toEqual({
        statusCode: 500,
        body: "{\"success\":false,\"message\":\"unkown_error\"}",
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        }
      });
    });
  });

  describe('when throws error with status code', () => {
    class Mock {
      @wrapper()
      test() {
        throw {
          statusCode: 404
        };
      }
    }

    const mock = new Mock();

    it('must return formatted answer', async () => {
      expect(await mock.test()).toEqual({
        statusCode: 404,
        body: "{\"success\":false,\"message\":\"unkown_error\"}",
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        }
      });
    });
  });

  describe('when throws error with body', () => {
    class Mock {
      @wrapper()
      test() {
        throw {
          body: { success: false, message: 'error' }
        };
      }
    }

    const mock = new Mock();

    it('must return formatted answer', async () => {
      expect(await mock.test()).toEqual({
        statusCode: 500,
        body: "{\"success\":false,\"message\":\"error\"}",
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        }
      });
    });
  });
});
