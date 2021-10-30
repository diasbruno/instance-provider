const assert = require('assert');
const Instantiator = require('../instantiator.js');

class A {}
class B {}
class C {}
class S {
  a = null;
  b = null;
  c = null;
  constructor(A, B, C) {
    this.a = A;
    this.b = B;
    this.c = C;
  }
}

describe('Instantiator', () => {
  let i;

  beforeEach(() => (i = new Instantiator()));

  it('should create a new instance.', () => {
    i.add(A);
    assert.ok(i.get(A.name) instanceof A);
  });

  it('must return the same instance.', () => {
    i.add(A);
    assert.ok(i.get(A.name) === i.get(A.name));
  });

  it('must resolve its dependencies.', () => {
    i.add(A);
    i.add(B);
    i.add(C);
    i.add(S);
    assert.ok(i.get(A.name) === i.get(S.name).a);
  });

  it('must throw if it cannot resolve dependency.', () => {
    try {
      i.add(S);
    } catch (e) {
      assert.ok(/\'A\'/.exec(e.message)[1]);
    }
  });
});
