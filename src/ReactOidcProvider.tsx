import React, { ReactNode } from 'react'

import { Log, User, UserManager } from 'oidc-client'

export type ProviderConfig = {
  authority: string
  clientID: string
  clientOrigin: string
  responseType: string
  scope: string
  tokenExpiryWarningSeconds?: number
}

type ProviderUser = {
  email?: string
  name?: string
  familyName?: string
  givenName?: string
  ipAddress: string
  idToken: string
}

type ProviderProps = {
  config: ProviderConfig
  children: (
    user: ProviderUser | undefined,
    isLoggedIn: boolean,
    error: Error | undefined,
    isError: boolean,
    isLoading: boolean,
    isTokenExpiring: boolean,
    loginAction: () => void,
    logoutAction: () => void,
  ) => ReactNode
}

type ProviderState = {
  user?: ProviderUser
  isLoggedIn: boolean
  error?: Error
  isError: boolean
  isLoading: boolean
  isTokenExpiring: boolean
}

export class Provider extends React.Component<ProviderProps, ProviderState> {
  private userManager: UserManager

  constructor(props: ProviderProps) {
    super(props)
    this.state = {
      user: undefined,
      isLoggedIn: false,
      error: undefined,
      isError: false,
      isLoading: true,
      isTokenExpiring: false,
    }

    const { config } = props
    const settings = {
      authority: config.authority,
      client_id: config.clientID,
      redirect_uri: config.clientOrigin,
      post_logout_redirect_uri: config.clientOrigin,
      response_type: config.responseType,
      scope: config.scope,
      accessTokenExpiringNotificationTime: config.tokenExpiryWarningSeconds ? config.tokenExpiryWarningSeconds : 60,
    }
    this.userManager = new UserManager(settings)

    this.userManager.events.addAccessTokenExpiring(this.accessTokenExpiring.bind(this))
    this.userManager.events.addAccessTokenExpired(this.accessTokenExpired.bind(this))

    Log.logger = console
    Log.level = Log.ERROR
  }

  componentDidMount(): void {
    console.log('loading react-oidc-provider component...')
    this.setState({ isLoading: true })

    if (window.location.hash) {
      this.userManager.signinRedirectCallback().then(
        (user: User) => {
          const providerUser: ProviderUser = {
            email: user.profile.email,
            name: user.profile.name,
            familyName: user.profile.family_name,
            givenName: user.profile.given_name,
            ipAddress: user.profile.ipaddr,
            idToken: user.id_token,
          }
          this.setState({ user: providerUser, isLoggedIn: true, isLoading: false })
          console.log('signin success')
          console.log('User: ', providerUser)
          console.log(user)
          window.history.replaceState(null, '', '/')
        },
        (error: Error) => {
          this.setState({ error, isError: true, isLoading: false })
          console.error(error)
          window.history.replaceState(null, '', '/')
        },
      )
    } else {
      this.userManager.getUser().then(
        (user: User | null) => {
          if (user == null) {
            this.setState({ user: undefined, isLoggedIn: false, isLoading: false })
            console.log('User is NOT logged in')
          } else if (user.expired) {
            this.setState({ user: undefined, isLoggedIn: false, isLoading: false })
            console.log('User login has expired')
          } else {
            const providerUser: ProviderUser = {
              email: user.profile.email,
              name: user.profile.name,
              familyName: user.profile.family_name,
              givenName: user.profile.given_name,
              ipAddress: user.profile.ipaddr,
              idToken: user.id_token,
            }
            this.setState({ user: providerUser, isLoggedIn: true, isLoading: false })
            console.log('User: ', providerUser)
            console.log(user)
          }
        },
        (error: Error) => {
          this.setState({ error, isError: true, isLoading: false })
          console.error(error)
        },
      )
    }
  }

  componentWillUnmount(): void {
    this.userManager.events.removeAccessTokenExpiring(this.accessTokenExpiring.bind(this))
    this.userManager.events.removeAccessTokenExpired(this.accessTokenExpired.bind(this))
  }

  accessTokenExpiring(): void {
    this.setState({ isTokenExpiring: true })
  }

  accessTokenExpired(): void {
    this.setState({ user: undefined, isLoggedIn: false, isTokenExpiring: false })
  }

  signIn(): void {
    this.setState({ isLoading: true })

    this.userManager.signinRedirect().then(
      () => {
        console.log('signin initiated...')
      },
      (error: Error) => {
        this.setState({ error, isError: true, isLoading: false })
        console.error(error)
      },
    )
  }

  signOut(): void {
    this.setState({ isLoading: true })

    this.userManager.signoutRedirect().then(
      () => {
        console.log('signout initiated...')
      },
      (error: Error) => {
        this.setState({ error, isError: true, isLoading: false })
        console.error(error)
      },
    )
  }

  render(): React.ReactNode {
    const { children } = this.props
    const { user, isLoggedIn, error, isError, isLoading, isTokenExpiring } = this.state
    return children(
      user,
      isLoggedIn,
      error,
      isError,
      isLoading,
      isTokenExpiring,
      this.signIn.bind(this),
      this.signOut.bind(this),
    )
  }
}
