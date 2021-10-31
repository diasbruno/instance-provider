const assert = require('assert');
const Instantiator = require('../instantiator.js');

[
  [
    'should create a new instance.', (i) => {
      class A {}
      A.create = function() { return new this(); };
      i.addSingleInstance(A);
      assert.ok(i.get(A.name) instanceof A);
    }
  ],
  [
    'must return the same instance.', (i) => {
      class A {}
      A.create = function() { return new this(); };
      i.addSingleInstance(A);
      assert.ok(i.get(A.name) === i.get(A.name));
    }
  ],
  [
    'must resolve its dependencies.', (i) => {
      class A {}
      A.create = function() { return new this(); };
      class B {}
      B.create = function() { return new this(); };
      class C {}
      C.create = function() { return new this(); };
      class S {}
      S.create = function(A, B, C) {
        const instance = new this();
        instance.a = A;
        instance.b = B;
        instance.c = C;
        return instance;
      };
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
        class S {}
        S.create = function(A) {
          const instance = new this();
          instance.a = A;
          return instance;
        };
        i.addSingleInstance(S);
      } catch (e) {
        assert.ok(/\'A\'/.exec(e.message)[1]);
      }
    }
  ],
  [
    'must instantiate a service and dont cache.', (i) => {
      class T {}
      T.create = function() { return new this(); };
      class V {}
      V.create = function(T) {
        const instance = new this();
        instance.t = T;
        return instance;
      };
      i.addNoCache(T).
        addSingleInstance(V);
      assert.ok(i.get(T.name) !== i.get(V.name).t);
    }
  ],
  [
    'must instantiate a new service with same dependency.', (i) => {
      class T {}
      T.create = function() { return new this(); };
      class V {}
      V.create = function(T) {
        const instance = new this();
        instance.t = T;
        return instance;
      };
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
      T.create = function() { return new this(); };
      class V extends T {}
      V.create = function() { return new this(); };
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
      T.create = function() { return new this(); };
      class V {}
      V.create = function() { return new this(); };
      i.addSingleInstance(T).
        addNoCache(V);
      const t = i.get(T.name);
      i.dispose();
      assert.ok(t !== i.get(T.name));
    }
  ],
  [
    'can handle arrow function.', (i) => {
      class T {}
      T.create = () => new T();
      class U {}
      U.create = (T) => {
        const u = new V();
        u.t = T;
        return u;
      };
      class V {}
      V.create = (T, U) => {
        const v = new V();
        v.t = T; v.u = U;
        return v;
      };
      i.addSingleInstance(T).addSingleInstance(U).addSingleInstance(V);
      let t;
      assert.ok(Boolean((t = i.get(T.name))));
      assert.ok(Boolean(i.get(U.name)));
      assert.ok(i.get(V.name).t === t);
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
