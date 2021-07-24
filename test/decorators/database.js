const assert = require('assert');
const sinon = require('sinon');
const { database } = require('../../decorators');

describe('decorators', () => {
  describe('#database', () => {
    describe('#execute', () => {
      const mongoose = { connect: () => {} };
      let cb = () => {};

      beforeEach(() => {
        sinon.replace(mongoose, 'connect', sinon.fake.resolves());
        cb = sinon.fake.resolves('return');
      });

      afterEach(() => {
        sinon.restore();
      });

      it('should return function', () => {
        const rt = database(cb, mongoose);
        assert.strictEqual(typeof rt, 'function');
      });

      it('returned cb must call fake', async () => {
        await database(cb, mongoose)();
        assert.strictEqual(cb.callCount, 1);
      });

      it('must connect only one time', async () => {
        await database(cb, mongoose)();
        assert.strictEqual(mongoose.connect.callCount, 1);
      });
    });
  });
});
