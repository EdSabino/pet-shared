
import { inject } from "../src/index";

describe('@inject', () => {
  describe('must inject services', () => {
    class TestService {}

    @inject({
      model: new TestService(),
      services: {
        testService: TestService
      }
    })
    class Mock {
      model: any;
      services: any;
    }

    const mock = new Mock();

    it('must have services', async () => {
      expect(mock.services.testService).toBeInstanceOf(TestService);
    });

    it('must have model', async () => {
      expect(mock.model).toBeInstanceOf(TestService);
    });
  });
});
