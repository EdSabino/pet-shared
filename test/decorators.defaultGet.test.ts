
import { defaultGet } from "../src/index";

describe('@defaultGet', () => {
  describe('when success', () => {
    class Mock {
      constructor () {
        this.model = {
          findOne: jest.fn(x => ({ result: true })),
          publicFields: jest.fn(() => 'name')
        }
      }
      
      model: any;
      
      @defaultGet('test')
      async test(event: any) {}
    }

    const mock = new Mock();
    const event = {
      pathParameters: {
        _id: '1234'
      },
    }

    it('must return value formatted', async () => {
      expect(await mock.test(event)).toStrictEqual({
        statusCode: 200,
        body: {
          success: true,
          test: { result: true }
        }
      });
    });

    it('must have called updateOne', async () => {
      await mock.test(event);
      expect(mock.model.findOne.mock.calls.length).toBe(2);
      expect(mock.model.publicFields.mock.calls.length).toBe(2);
    });
  });

  describe('when is not founded', () => {
    class Mock {
      constructor () {
        this.model = {
          findOne: jest.fn(x => null),
          publicFields: jest.fn(() => 'name')
        }
      }
      
      model: any;
      
      @defaultGet('test')
      async test(event: any) {}
    }

    const mock = new Mock();
    const event = {
      pathParameters: {
        _id: '1234'
      },
    }

    it('must throws not found error', async () => {
      await expect(async () => mock.test(event)).rejects.toEqual({
        statusCode: 404,
        body: { success: false, message: `test_not_found` }
      });

      expect(mock.model.findOne.mock.calls.length).toBe(1);
      expect(mock.model.publicFields.mock.calls.length).toBe(1);
    });
  });
});
