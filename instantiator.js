const NODEPS = [];

const CONSTRUCTOR_R = /\bconstructor\((.*)\)/;

const SINGLE_INSTANCE = 'SINGLE_INSTANCE';

const deps = ds => ds.replace(/[\,\s]+/g, ',').split(',');

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

  add(service) {
    const deps = findDependencies(service);
    this.services[service.name] = new SingleInstance(service, deps);
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
}
