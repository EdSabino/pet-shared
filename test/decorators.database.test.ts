
import { database } from "../src/index";

describe('@database', () => {
  const mockConnect = jest.fn(x => x);

  class Mock {
    constructor () {
      this.mongooseService = {
        connect: mockConnect
      }
    }

    mongooseService: any;

    @database()
    test() {}
  }

  describe('must be called', () => {
    beforeEach(() => {
      const mock = new Mock();

      mock.test();
    });

    it('once', () => {
      expect(mockConnect.mock.calls.length).toBe(1);
    });
  });
});
