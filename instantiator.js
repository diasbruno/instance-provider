const NODEPS = [];

const DEPS_R = /function\s*\((.*)?\)\s*\{|\((.*)?\)\s*=/;
const COMMA_R = /[\,\s]+/g;

const SINGLE_INSTANCE = 'SINGLE_INSTANCE';

const deps = ds => ds.replace(COMMA_R, ',').split(',');

class AlwaysNew {
  constructor(service, deps) {
    this.service = service;
    this.deps = deps;
    this.instance = null;
  }

  get(services) {
    const dependencies = this.deps.map(d => services.get(d));
    return this.service.create(...dependencies);
  }

  dispose() {}
}

class SingleInstance {
  constructor(service, deps) {
    this.service = service;
    this.deps = deps;
    this.instance = null;
  }

  instantiate(services) {
    const dependencies = this.deps.map(d => services.get(d));
    return this.instance = this.service.create(...dependencies);
  }

  get(services) {
    return this.instance || this.instantiate(services);
  }

  dispose() {
    this.instance = null;
  }
}

const findDependencies = service => {
  const s = service.create.toString();
  const sa = DEPS_R.exec(s) || [];
  const ds = sa[1] || sa[2] || '';
  return ds ? deps(ds) : NODEPS;
};

module.exports = class Instantiator {
  services = null;

  constructor() {
    this.services = new Map();
  }

  make(service, strategy) {
    const deps = findDependencies(service);
    this.services[service.name] = new strategy(service, deps);
  }

  addSingleInstance(service) {
    return this.make(service, SingleInstance), this;
  }

  addNoCache(service) {
    return this.make(service, AlwaysNew), this;
  }

  instance(service) {
    const _ = this.services[service];
    if (!_) {
      throw Error(`Service '${service}' not found`);
    }
    return _.get(this);
  }

  get(service) {
    return this.instance(service);
  }

  dispose() {
    for (let s in this.services) {
      const service = this.services[s];
      service.dispose();
    }
  }
}
