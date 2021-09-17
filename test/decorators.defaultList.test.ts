
import { defaultList } from "../src/index";

describe('@defaultList', () => {
  describe('when success', () => {
    class Mock {
      constructor () {
        this.model = {
          find: jest.fn(() => [{ result: true }]),
          countDocuments: jest.fn(() => 12),
          publicFields: jest.fn(() => 'name')
        }
      }
      
      model: any;
      
      @defaultList('test')
      async test(event: any) {}
    }

    const mock = new Mock();
    const event = {
      queryStringParameters: {
        page: 1,
        size: 10
      }
    };

    it('must return value formatted', async () => {
      expect(await mock.test(event)).toStrictEqual({
        statusCode: 200,
        body: {
          success: true,
          docs: [{ result: true }],
          paginate: {
            page: 1,
            count: 12,
            size: 10
          }
        }
      });

      expect(mock.model.find.mock.calls.length).toBe(1);
      expect(mock.model.countDocuments.mock.calls.length).toBe(1);
      expect(mock.model.publicFields.mock.calls.length).toBe(1);
    });
  });

  describe('when throws error', () => {
    class Mock {
      constructor (error: any) {
        this.error = error;
        this.model = {
          find: jest.fn(x => x),
          countDocuments: jest.fn(() => 0),
          publicFields: jest.fn(() => 'name')
        }
      }
      
      model: any;
      error: any;
      
      @defaultList('test')
      async test(event: any) {
        throw this.error;
      }
    }

    const mock = new Mock('');
    const event = {
      queryStringParameters: {
        page: 1,
        size: 10
      }
    };

    it('must throws empty error', async () => {
      await expect(async () => mock.test(event)).rejects.toEqual({
        statusCode: 404,
        body: { success: false, message: `test_not_found` }
      });

      expect(mock.model.find.mock.calls.length).toBe(0);
      expect(mock.model.countDocuments.mock.calls.length).toBe(0);
      expect(mock.model.publicFields.mock.calls.length).toBe(0);
    });
  });
});
