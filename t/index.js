const assert = require('assert');
const Instantiator = require('../instantiator.js');

describe('Instantiator', () => {
  let i;

  beforeEach(() => (i = new Instantiator()));

  it('should create a new instance.', () => {
    class S {}

    i.add(S);

    assert.ok(i.get(S) instanceof S);
  });

  it('must return the same instance.', () => {
    class S {}

    i.add(S);

    assert.ok(i.get(S) === i.get(S));
  });
});
