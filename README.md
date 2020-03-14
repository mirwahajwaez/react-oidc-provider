# React OIDC Provider

## Introduction

React OIDC Provider is a library that enables OIDC based authentication against a variety of public Authentication providers. Currently used in production in an Enterprise context against an Azure AD directory.

Using React OIDC Provider virtually removes the requirement for dealing with Authentication in your app.

## Installation

The library can be installed using one of the following commands:

```bash
npm install react-oidc-provider

--or--

yarn add react-oidc-provider
```

## Usage

The code below provides a minimal example component:

```tsx
import React from 'react'

import { Provider, ProviderConfig } from 'react-oidc-provider'

const config: ProviderConfig = {
  authority: 'https://demo.identityserver.io/',
  clientID: 'implicit.shortlived',
  clientOrigin: 'http://localhost:3000',
  scope: 'openid email profile',
  responseType: 'id_token token',
  tokenExpiryWarningSeconds: 60,
}

const App: React.FC = () => {
  return (
    <Provider config={config}>
      {(user, isLoggedIn, error, isError, isLoading, isTokenExpiring, login, logout) => {
        if (isError) {
          console.log(error)
          return (
            <>
              <p>There is an Error. Logged to the console...</p>
            </>
          )
        } else if (isLoading) {
          return <p>Is Loading...</p>
        } else if (!isLoggedIn) {
          return (
            <>
              <p>User is Not Logged In</p>
              <button onClick={login}>Sign In</button>
            </>
          )
        } else {
          return (
            <>
              <p>User is Logged In</p>
              <p>User: {user && user.name}</p>
              <p>eMail: {user && user.email}</p>
              <p>Token Expiring: {isTokenExpiring ? 'YES' : 'NO'}</p>
              {isTokenExpiring && <button onClick={login}>Re-Authenticate</button>}
              <br />
              <button onClick={logout}>Sign Out</button>
            </>
          )
        }
      }}
    </Provider>
  )
}
```

The credentials provided are for a public hosted OIDC server.

The login screen you are redirected to provides some basic instructions for logging on with either a) using a static pair of credentils; or b) with any Google credentials.

Further information on the service and options provided are available via the following URL: https://demo.identityserver.io/

## Samples

The samples folder contains a simple React application that leverages the component for login.

To run the minimal sample:

```
cd samples/simple <kbd>Return</kbd>
npm install --or-- yarn
npm start   --or-- yarn start
```

## Issues

Please feel free to raise any issues via GitHub.

## Future Enhancements

- [ ] Add examples and configuration detail for popular OAUTH2 / OPENID providers.
