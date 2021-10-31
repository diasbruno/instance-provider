// * Boring details

const localStorage = {
  mem: {},
  getItem(name) { return this.mem[name]; },
  setItem(name, item) { this.mem[name] = item; },
};

function unauthorized() {
  throw new Error('Unauthorized');
};

function http(config) {
  this.config = config;
}

http.create = function(config) {
  return new http(config);
};

http.post = function(url, data) {
  const mocks = {
    '/login': () => Promise.resolve({
      access_token: 'token'
    })
  }
  return mocks[url]();
};

http.prototype.get = function(url) {
  const mocks = {
    '/users': () => {
      if (!this.config.token)  {
        unauthorized();
      }

      return Promise.resolve([
        { id: 1, name: 'First' },
        { id: 2, name: 'Second' }
      ]);
    },
    '/user/1': unauthorized
  };
  return mocks[url]();
};

// * Infraestructure you always write...

// This class manage the token on localstorage
class AuthToken {
  constructor() {
    // when it's first required, get the token on the
    // localStorage and keep it here
    this.updateToken(localStorage.getItem('access_token'));
  }

  get token() {
    return this._token;
  }

  updateToken(token) {
    this._token = token;
    localStorage.setItem('access_token', token);
  }
}

// this is the data source where we actually deal
// with users
class UserDataSource {
  constructor(AuthToken) {
    // when it's first required it create it's own
    // instance of the transport it will use (e.g) axios, xhr

    // STOP USING INTERCEPTOR FOR THIS.
    this.requester = http.create({
      baseURL: 'https://localhost:8000/',
      token: AuthToken.token,
    });
  }

  all() {
    return this.requester.get('/users');
  }

  byId(id) {
    return this.requester.get(`/user/${id}`);
  }
}

// a simple auth service
class AuthService {
  constructor(AuthToken) {
    // scope the AuthToken, so when we login,
    // we update the token...then UserService
    // can use
    this.authToken = AuthToken;
  }

  login(name, pass) {
    return http.post('/login', { name, pass }).then(
      ({ access_token }) => (this.authToken.updateToken(access_token), { access_token })
    );
  }
}

// a simple user service that will use the UserDataSource
class UserService {
  constructor(UserDataSource) {
    this.dataSource = UserDataSource;
  }

  all() {
    return this.dataSource.all();
  }

  byId(id) {
    return this.dataSource.byId(id);
  }
}

const Provider = require('./index');

// define how the lifetime of the services
Provider.addSingleInstance(AuthToken).
  addSingleInstance(UserDataSource).
  addSingleInstance(AuthService).
  addSingleInstance(UserService);

// instances are created lazily, so only
// whem they are requested
(async function Example() {
  console.log("running example...");

  try {
    const userService = Provider.get(UserService.name);
    const users = await userService.all();
  } catch(e) {
    console.log(e.message);
    console.log("- not logged yet");
  }

  try {
    const authService = Provider.get(AuthService.name);

    console.log("- logging in");
    const auth = await authService.login('meh', 'bla');

    const authToken = Provider.get(AuthToken.name);
    console.log("- token after login", `'${authToken.token}'`);

    console.log("- getting users");
    const userService = Provider.get(UserService.name);
    const users = await userService.all();
    console.log(users);

    console.log("- getting user by id (unauthorized)");
    userService.byId(1); // simulate unauthorized
  } catch(e) {
    console.log(e.message);
    console.log("- logging out");

    Provider.get(AuthToken.name).updateToken(null);
    // throw away all retained instances
    Provider.dispose();

    const authToken = Provider.get(AuthToken.name);
    console.log("- token after logout", `'${authToken.token}'`);
  }
})();
