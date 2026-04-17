// eslint-disable-next-line import/order
import React from 'react'
import renderer from 'react-test-renderer'
import { FVFlowContext } from '../context/FVFlowContext'

// Mock dependencies
jest.mock('@gooddollar/web3sdk-v2', () => ({
  useIdentityExpiryDate: jest.fn(),
}))

jest.mock('../../../../lib/wallet/GoodWalletProvider', () => ({
  useWallet: jest.fn(),
}))

jest.mock('../../hooks/useEnrollmentIdentifier', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('../../hooks/useDisposingState', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('../../hooks/useFaceTecSDK', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('../hooks/useFVRedirect', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('../hooks/useFVLoginInfoCheck', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('../../../../lib/dialog/useDialog', () => ({
  useDialog: jest.fn(() => ({ showDialog: jest.fn() })),
}))

jest.mock('../../../../lib/utils/asyncStorage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}))

jest.mock('../../../../lib/analytics/analytics', () => ({
  fireEvent: jest.fn(),
  FV_INTRO: 'FV_INTRO',
  FV_CAMERAPERMISSION: 'FV_CAMERAPERMISSION',
  FV_CANTACCESSCAMERA: 'FV_CANTACCESSCAMERA',
}))

jest.mock('../../../../lib/utils/platform', () => ({
  isWebView: false,
  isIOSWeb: false,
  iosSupportedWeb: true,
  isBrowser: true,
  isEmulator: Promise.resolve(false),
}))

jest.mock('../../../../lib/utils/linking', () => ({
  openLink: jest.fn(),
}))

jest.mock('../../../../config/config', () => ({
  faceVerificationPrivacyUrl: 'https://example.com/privacy',
}))

jest.mock('../../../../lib/logger/js-logger', () => ({
  __esModule: true,
  default: () => ({
    child: () => ({
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    }),
  }),
}))

// Mock permissions hooks
jest.mock('../../../permissions/hooks/usePermissions', () => ({
  __esModule: true,
  default: jest.fn(() => [null, jest.fn()]),
}))

jest.mock('../../../browserSupport/hooks/useCameraSupport', () => ({
  __esModule: true,
  default: jest.fn(() => [null, jest.fn()]),
}))

jest.mock('../../../common/dialogs/showQueueDialog', () => ({
  showQueueDialog: jest.fn(),
}))

import { useIdentityExpiryDate } from '@gooddollar/web3sdk-v2'
import { useWallet } from '../../../../lib/wallet/GoodWalletProvider'
import useEnrollmentIdentifier from '../../hooks/useEnrollmentIdentifier'
import useDisposingState from '../../hooks/useDisposingState'

const createMockExpiryDate = (isReverify = false) => ({
  lastAuthenticated: {
    isZero: () => !isReverify,
    toNumber: () => isReverify ? 1609459200 : 0,
  },
  authPeriod: {
    toNumber: () => 360,
  },
})

const mockUseDisposingState = (disposing = false) => [
  disposing,
  jest.fn(),
]

const renderWithContext = (component, contextValue) => {
  return renderer.create(
    <FVFlowContext.Provider value={contextValue}>
      {component}
    </FVFlowContext.Provider>
  )
}

jest.setTimeout(30000)

describe('Standalone FaceVerification IntroScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    useWallet.mockReturnValue({ account: '0x1234567890abcdef1234567890abcdef12345678' })
    useEnrollmentIdentifier.mockReturnValue({
      faceIdentifier: 'test-enrollment-id',
      v1FaceIdentifier: 'test-fv-signer',
    })
    useDisposingState.mockReturnValue(mockUseDisposingState(false))
  })

  it('renders Overview screen for first-time users (isReverify = false)', async () => {
    useIdentityExpiryDate.mockReturnValue([
      createMockExpiryDate(false),
      null,
      'success',
    ])

    const IntroScreen = require('../screens/IntroScreen').default
    
    const contextValue = {
      account: '0x1234567890abcdef1234567890abcdef12345678',
      firstName: 'Test',
      isFVFlow: true,
      isFVFlowReady: true,
    }

    const screenProps = {
      push: jest.fn(),
      navigateTo: jest.fn(),
    }

    let component
    await renderer.act(async () => {
      component = renderWithContext(
        <IntroScreen screenProps={screenProps} navigation={{}} />,
        contextValue
      )
    })

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders Action screen directly for reverify users (isReverify = true)', async () => {
    useIdentityExpiryDate.mockReturnValue([
      createMockExpiryDate(true),
      null,
      'success',
    ])

    const IntroScreen = require('../screens/IntroScreen').default
    
    const contextValue = {
      account: '0x1234567890abcdef1234567890abcdef12345678',
      firstName: 'Test',
      isFVFlow: true,
      isFVFlowReady: true,
    }

    const screenProps = {
      push: jest.fn(),
      navigateTo: jest.fn(),
    }

    let component
    await renderer.act(async () => {
      component = renderWithContext(
        <IntroScreen screenProps={screenProps} navigation={{}} />,
        contextValue
      )
    })

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('shows loading state when identity expiry is pending', async () => {
    useIdentityExpiryDate.mockReturnValue([
      null,
      null,
      'pending',
    ])

    const IntroScreen = require('../screens/IntroScreen').default
    
    const contextValue = {
      account: '0x1234567890abcdef1234567890abcdef12345678',
      firstName: 'Test',
      isFVFlow: true,
      isFVFlowReady: true,
    }

    const screenProps = {
      push: jest.fn(),
      navigateTo: jest.fn(),
    }

    let component
    await renderer.act(async () => {
      component = renderWithContext(
        <IntroScreen screenProps={screenProps} navigation={{}} />,
        contextValue
      )
    })

    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
