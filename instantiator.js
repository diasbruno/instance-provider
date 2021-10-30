let services = new Map();

module.exports = class Instantiator {
  add(service) {
    const instances = [];
    const configuration = {};
    services[service] = null;
  }

  instance(service) {
    return services[service];
  }

  get(service) {
    const instance = this.instance(service);
    return instance || (services[service] = new service());
  }
}
