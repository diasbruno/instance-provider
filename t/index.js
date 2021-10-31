const assert = require('assert');
const Instantiator = require('../instantiator.js');

[
  [
    'should create a new instance.', (i) => {
      class A {}
      i.addSingleInstance(A);
      assert.ok(i.get(A.name) instanceof A);
    }
  ],
  [
    'must return the same instance.', (i) => {
      class A {}
      i.addSingleInstance(A);
      assert.ok(i.get(A.name) === i.get(A.name));
    }
  ],
  [
    'must resolve its dependencies.', (i) => {
      class A {}
      class B {}
      class C {}
      class S {
        constructor(A, B, C) {
          this.a = A;
          this.b = B;
          this.c = C;
        }
      }
      i.addSingleInstance(A).
        addSingleInstance(B).
        addSingleInstance(C).
        addSingleInstance(S);
      assert.ok(i.get(A.name) === i.get(S.name).a);
    }
  ],
  [
    'must throw if it cannot resolve dependency.', (i) => {
      try {
        class S {
          constructor(A) {
            this.a = A;
          }
        }
        i.addSingleInstance(S);
      } catch (e) {
        assert.ok(/\'A\'/.exec(e.message)[1]);
      }
    }
  ],
  [
    'must instantiate a service and dont cache.', (i) => {
      class T {}
      class V {
        constructor(T) {
          this.t = T;
        }
      }
      i.addNoCache(T).
        addSingleInstance(V);
      assert.ok(i.get(T.name) !== i.get(V.name).t);
    }
  ],
  [
    'must instantiate a new service with same dependency.', (i) => {
      class T {}
      class V {
        constructor(T) {
          this.t = T;
        }
      }
      i.addSingleInstance(T).
        addNoCache(V);
      const v = i.get(V.name);
      assert.ok(i.get(T.name) === v.t);
      assert.ok(i.get(V.name) !== v);
    }
  ],
  [
    'same class different strategies (through extension).', (i) => {
      class T {}
      class V extends T {}
      i.addSingleInstance(T).
        addNoCache(V);
      const v = i.get(V.name);
      const t = i.get(T.name);
      assert.ok(v !== t);
      assert.ok(t === i.get(T.name));
      assert.ok(v !== i.get(V.name));
    }
  ],
  [
    'dispose instances of services.', (i) => {
      class T {}
      class V {}
      i.addSingleInstance(T).
        addNoCache(V);
      const t = i.get(T.name);
      i.dispose();
      assert.ok(t !== i.get(T.name));
    }
  ]
].forEach(([title, test]) => {
  try {
    console.log(title);
    test(new Instantiator());
  } catch(e) {
    console.log("[failed]", title);
    console.log(e);
    process.exit(1);
  }
});
