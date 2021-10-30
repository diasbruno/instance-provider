const NODEPS = [];

const CONSTRUCTOR_R = /\bconstructor\((.*)\)/;
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
    return new this.service(...dependencies);
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
    const instance = new this.service(...dependencies);
    this.instance = instance;
    return instance;
  }

  get(services) {
    return this.instance || this.instantiate(services);
  }

  dispose() {
    this.instance = null;
  }
}

const findDependencies = service => {
  const s = service.toString()
  const ds = (CONSTRUCTOR_R.exec(s) || [])[1] || '';
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
    this.make(service, SingleInstance);
  }

  addNoCache(service) {
    this.make(service, AlwaysNew);
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
