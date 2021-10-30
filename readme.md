# instantiator

Manage instantiation and lifetime of classes.

This project is intended to help users to instantiate correctly
and automatically handle their lifetime.

## usage

```js
// This class manage the token on localstorage
class AuthToken {
  constructor() {
    // when it's first required, get the token on the
    // localStorage and keep it here
    this.updateToken(localStore.get('access_token'));
  }

  get token() {
    return this._token;
  }

  updateToken(token) {
    this._token = token;
    localStore.set('access_token', token);
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
      ({ data: { access_token } }) => this.authToken.updateToken(access_token)
    ).catch(
      () => { /* do something */ }
    );
  }
}

// a simple user service that will use the UserDataSource
class UserService {
  construct(UserDataSource) {
    this.dataSource = UserDataSource;
  }

  all() {
    return this.dataSource.allUsers();
  }
}

const instantiator = require('./index.js');

// define how the lifetime of the services
instantiator.addSingleInstance(AuthToken).
  addSingleInstance(UserDataSource).
  addSingleInstance(AuthService).
  addSingleInstance(UserService);

function login(name, pass) {
  // instances are created lazily, so only
  // whem they are requested
  const service = instantiator.get(AuthService.name);
  return service.login(name, pass).then(
    () => {
      const service = instantiator.get(UserServices.name);
      console.log(service.all());
    }
  );
}

function logout() {
  instantiator.get(AuthToken.name).updateToken(null);
  // throw away all retained instances
  instantiator.dispose();
}
```

## license

Unlicense (see [LICENSE](https://github.com/diasbruno/instantiator/blob/main/LICENSE))
