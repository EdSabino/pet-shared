
import { defaultUpdate } from "../src/index";

describe('@defaultUpdate', () => {
  describe('when success', () => {
    class Mock {
      constructor () {
        this.model = {
          updateOne: jest.fn(x => ({ ok: 1 }))
        }
      }
      
      model: any;
      
      @defaultUpdate(false, 'test')
      async test(event: any) {}
    }

    const mock = new Mock();
    const event = {
      pathParameters: {
        _id: '1234'
      },
      body: '{"_id": "123"}'
    }

    it('must return value formatted', async () => {
      expect(await mock.test(event)).toStrictEqual({ statusCode: 200, body: { success: true, _id: '1234' }});
    });

    it('must have called updateOne', async () => {
      await mock.test(event);
      expect(mock.model.updateOne.mock.calls.length).toBe(2);
    });
  });

  describe('when is not founded', () => {
    class Mock {
      constructor () {
        this.model = {
          updateOne: jest.fn(x => ({ ok: 0 }))
        }
      }
      
      model: any;
      
      @defaultUpdate(false, 'test')
      async test(event: any) {}
    }

    const mock = new Mock();

    it('must throws not found error', async () => {
      await expect(async () => mock.test({ body: '{}', pathParameters: { _id: '1234'}})).rejects.toEqual({
        statusCode: 404,
        body: { success: false, message: `test_not_found` }
      });

      expect(mock.model.updateOne.mock.calls.length).toBe(1);
    });
  });

  describe('when throws error', () => {
    class Mock {
      constructor (error: any) {
        this.error = error;
        this.model = {
          updateOne: jest.fn(x => x)
        }
      }
      
      model: any;
      error: any;
      
      @defaultUpdate(true, 'test')
      async test(event: any) {
        throw this.error;
      }
    }

    describe('when error generic', () => {
      const mock = new Mock('');

      it('must throws empty error', async () => {
        await expect(async () => mock.test({})).rejects.toEqual({});
        expect(mock.model.updateOne.mock.calls.length).toBe(0);
      });
    });

    describe('when error object', () => {
      const result = { success: false };
      const mock = new Mock(result);

      it('must rethrows', async () => {
        await expect(async () => mock.test({})).rejects.toEqual(result);
        expect(mock.model.updateOne.mock.calls.length).toBe(0);
      });
    });

    describe('when validation error', () => {
      const result = {
        errors: {
          name: {
            properties: {
              message: 'required'
            }
          }
        }
      };
      const mock = new Mock(result);

      it('must format error', async () => {
        await expect(async () => mock.test({})).rejects.toEqual({
          statusCode: 422,
          body: {
            success: false,
            error_fields: {
              name: 'required'
            },
            message: 'required'
          }
        });

        expect(mock.model.updateOne.mock.calls.length).toBe(0);
      });
    });
  });
});
