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
    i.addSingleInstance(A);
    assert.ok(i.get(A.name) instanceof A);
  });

  it('must return the same instance.', () => {
    i.addSingleInstance(A);
    assert.ok(i.get(A.name) === i.get(A.name));
  });

  it('must resolve its dependencies.', () => {
    i.addSingleInstance(A);
    i.addSingleInstance(B);
    i.addSingleInstance(C);
    i.addSingleInstance(S);
    assert.ok(i.get(A.name) === i.get(S.name).a);
  });

  it('must throw if it cannot resolve dependency.', () => {
    try {
      i.addSingleInstance(S);
    } catch (e) {
      assert.ok(/\'A\'/.exec(e.message)[1]);
    }
  });

  it('must instantiate a service and dont cache.', () => {
    class T {}
    class V {
      constructor(T) {
        this.t = T;
      }
    }
    i.addNoCache(T);
    i.addSingleInstance(V);
    assert.ok(i.get(T.name) !== i.get(V.name).t);
  });

  it('must instantiate a new service with same dependency.', () => {
    class T {}
    class V {
      constructor(T) {
        this.t = T;
      }
    }
    i.addSingleInstance(T);
    i.addNoCache(V);
    const v = i.get(V.name);
    assert.ok(i.get(T.name) === v.t);
    assert.ok(i.get(V.name) !== v);
  });
});
