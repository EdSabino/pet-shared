const assert = require('assert');
const sinon = require('sinon');
const { handler } = require('../../decorators');

describe('decorators', () => {
  describe('#handler', () => {
    describe('#execute', () => {
      const UseCase = { execute: (event) => {} };

      it('should return function', () => {
        const rt = handler(UseCase, 200, 400);
        assert.strictEqual(typeof rt, 'function');
      });

      describe('successfully', () => {
        beforeEach(() => {
          sinon.replace(UseCase, 'execute', sinon.fake.resolves('{}'));
        });
        
        afterEach(() => {
          sinon.restore();
        });

        it('must call usecase', async () => {
          await handler(UseCase, 200, 400)();
          assert.strictEqual(UseCase.execute.callCount, 1);
        });

        it('must return second code', async () => {
          const rt = await handler(UseCase, 200, 400)();
          assert.strictEqual(rt.statusCode, 200);
        });
      });

      describe('failure', () => {
        beforeEach(() => {
          sinon.replace(UseCase, 'execute', sinon.fake.rejects('{}'));
        });
        
        afterEach(() => {
          sinon.restore();
        });

        it('must call usecase', async () => {
          await handler(UseCase, 200, 400)();
          assert.strictEqual(UseCase.execute.callCount, 1);
        });

        it('must return third code', async () => {
          const rt = await handler(UseCase, 200, 400)();
          assert.strictEqual(rt.statusCode, 400);
        });
      });
    });
  });
});
