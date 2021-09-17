
import { defaultCreate } from "../src/index";

describe('@defaultCreate', () => {
  describe('when success', () => {
    class Mock {
      constructor () {
        this.model = {
          create: jest.fn(x => x)
        }
      }
      
      model: any;
      
      @defaultCreate(false)
      async test(event: any) {}
    }

    const mock = new Mock();
    const event = {
      body: '{"_id": "123"}'
    }

    it('must return value formatted', async () => {
      expect(await mock.test(event)).toStrictEqual({ statusCode: 201, body: { success: true, _id: '123' }});
    });

    it('must have called create', async () => {
      await mock.test(event);
      expect(mock.model.create.mock.calls.length).toBe(2);
    });
  });

  describe('when throws error', () => {
    class Mock {
      constructor (error: any) {
        this.error = error;
        this.model = {
          create: jest.fn(x => x)
        }
      }
      
      model: any;
      error: any;
      
      @defaultCreate(true)
      async test(event: any) {
        throw this.error;
      }
    }

    describe('when error generic', () => {
      const mock = new Mock('');

      it('must throws empty error', async () => {
        await expect(async () => mock.test({})).rejects.toEqual({});
        expect(mock.model.create.mock.calls.length).toBe(0);
      });
    });

    describe('when error object', () => {
      const result = { success: false };
      const mock = new Mock(result);

      it('must rethrows', async () => {
        await expect(async () => mock.test({})).rejects.toEqual(result);
        expect(mock.model.create.mock.calls.length).toBe(0);
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

        expect(mock.model.create.mock.calls.length).toBe(0);
      });
    });
  });
});
