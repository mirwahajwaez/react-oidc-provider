import React, { ReactNode } from 'react'

import { Log, User, UserManager } from 'oidc-client'

export type ProviderConfig = {
  authority: string
  clientID: string
  clientOrigin: string
  loginRedirectPath: string
  logoutRedirectPath: string
  responseType: string
  scope: string
  tokenExpiryWarningSeconds?: number
}

type ProviderProps = {
  config: ProviderConfig
  children: (
    user: User | undefined,
    isLoggedIn: boolean,
    error: Error | undefined,
    isError: boolean,
    isLoading: boolean,
    isTokenExpiring: boolean,
    loginAction: () => void,
    logoutAction: () => void
  ) => ReactNode
}

type ProviderState = {
  user?: User
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
      isTokenExpiring: false
    }

    const { config } = props
    const settings = {
      authority: config.authority,
      client_id: config.clientID,
      redirect_uri: config.clientOrigin + config.loginRedirectPath,
      post_logout_redirect_uri: config.clientOrigin + config.logoutRedirectPath,
      response_type: config.responseType,
      scope: config.scope,
      accessTokenExpiringNotificationTime: config.tokenExpiryWarningSeconds ? config.tokenExpiryWarningSeconds : 60
    }
    this.userManager = new UserManager(settings)

    this.userManager.events.addAccessTokenExpiring(() => {
      this.setState({ isTokenExpiring: true })
    })

    this.userManager.events.addAccessTokenExpired(() => {
      this.setState({ user: undefined, isLoggedIn: false, isTokenExpiring: false })
    })

    Log.logger = console
    Log.level = Log.DEBUG
  }

  signIn() {
    this.setState({ isLoading: true })

    this.userManager.signinRedirect().then(
      () => {
        console.log('signin initiated...')
      },
      (error: Error) => {
        this.setState({ error: error, isError: true, isLoading: false })
        console.error(error)
      }
    )
  }

  signOut() {
    this.setState({ isLoading: true })

    this.userManager.signoutRedirect().then(
      () => {
        console.log('signout initiated...')
      },
      (error: Error) => {
        this.setState({ error: error, isError: true, isLoading: false })
        console.error(error)
      }
    )
  }
  componentDidMount() {
    console.log('loading react-oidc-provider component...')
    this.setState({ isLoading: true })

    if (window.location.pathname === this.props.config.loginRedirectPath) {
      this.userManager.signinRedirectCallback().then(
        (user: User) => {
          this.setState({ user: user, isLoggedIn: true, isLoading: false })
          console.log('signin success')
          console.log('User: ', user)
          history.replaceState(null, '', '/')
        },
        (error: Error) => {
          this.setState({ error: error, isError: true, isLoading: false })
          console.error(error)
          history.replaceState(null, '', '/')
        }
      )
    } else if (window.location.pathname === this.props.config.logoutRedirectPath) {
      this.userManager.signoutRedirectCallback().then(
        () => {
          this.setState({ user: undefined, isLoggedIn: false, isLoading: false })
          console.log('signout success')
          history.replaceState(null, '', '/')
        },
        (error: Error) => {
          this.setState({ error: error, isError: true, isLoading: false })
          console.error(error)
          history.replaceState(null, '', '/')
        }
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
            this.setState({ user: user, isLoggedIn: true, isLoading: false })
            console.log('User: ', user)
          }
        },
        (error: Error) => {
          this.setState({ error: error, isError: true, isLoading: false })
          console.error(error)
        }
      )
    }
  }

  render() {
    const { user, isLoggedIn, error, isError, isLoading, isTokenExpiring } = this.state
    return this.props.children(
      user,
      isLoggedIn,
      error,
      isError,
      isLoading,
      isTokenExpiring,
      this.signIn.bind(this),
      this.signOut.bind(this)
    )
  }
}
