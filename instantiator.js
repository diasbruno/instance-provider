const CONSTRUCTOR_R = /\bconstructor\((.*)\)/;

const deps = ds => ds.replace(/[\,\s]+/g, ',').split(',');

module.exports = class Instantiator {
  services = null;

  constructor() {
    this.services = new Map();
  }

  add(service) {
    const instances = [];
    const configuration = {
      deps: [],
      instance: null
    };
    const ds = (CONSTRUCTOR_R.exec(
      service.toString()
    ) || [])[1] || '';

    this.services[service.name] = {
      definition: service,
      deps: ds ? deps(ds) : [],
      instance: null
    };
  }

  instantiate(service) {
    const configuration = this.services[service],
          { definition, deps } = configuration;
    const dependencies = deps.map(d => this.get(d));
    const instance = new definition(...dependencies);
    configuration.instance = instance;
    return instance;
  }

  instance(service) {
    const _ = this.services[service];
    if (!_) {
      throw Error(`Service '${service}' not found`);
    }
    return _ && _.instance ? _.instance : this.instantiate(service);
  }

  get(service) {
    return this.instance(service);
  }
}
