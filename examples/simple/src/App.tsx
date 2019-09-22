import React from 'react'

import { Provider, ProviderConfig } from 'react-oidc-provider'

const config: ProviderConfig = {
  authority: 'https://demo.identityserver.io/',
  clientID: 'implicit.shortlived',
  clientOrigin: 'http://localhost:3000',
  loginRedirectPath: '/login_callback',
  logoutRedirectPath: '/logout_callback',
  scope: 'openid email profile',
  responseType: 'id_token token',
  tokenExpiryWarningSeconds: 60
}

const App: React.FC = () => {
  return (
    <Provider config={config}>
      {(user, isLoggedIn, error, isError, isLoading, isTokenExpiring, login, logout) => {
        if (isError) {
          return (
            <>
              <p>There is an Error</p>
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
              <p>User: {user && user.profile.name}</p>
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

export default App
