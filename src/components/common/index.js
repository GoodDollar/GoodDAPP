// @flow
//NOTICE: dont put any components that load wallet/userstorage here
//so we can lazy load them
import Address from './view/Address'
import AmountInput from './view/AmountInput'
import BigGoodDollar from './view/BigGoodDollar'
import BigNumber from './view/BigNumber'
import CopyButton from './buttons/CopyButton'
import CustomButton, { type ButtonProps } from './buttons/CustomButton'
import CustomDialog from './dialogs/CustomDialog'
import Icon from './view/Icon'
import IconButton from './buttons/IconButton'
import InputGoodDollar from './form/InputGoodDollar'
import InputRounded from './form/InputRounded'
import InputText from './form/InputText'
import LoadingIndicator from './view/LoadingIndicator'
import NumPadKeyboard from './view/NumPadKeyboard'
import QRCode from './view/QrCode/QRCode'
import SaveButton from './buttons/SaveButton'
import ScanQRButton from './buttons/ScanQRButton'
import ReceiveToAddressButton from './buttons/ReceiveToAddressButton'
import SendToAddressButton from './buttons/SendToAddressButton'
import SendToAddress from './buttons/SendToAddress'
import AwaitButton from './buttons/AwaitButton'
import Section from './layout/Section'
import ShareButton from './buttons/ShareButton'
import Text from './view/Text'
import Wrapper from './layout/Wrapper'
import WrapperClaim from './layout/WrapperClaim'
import ClaimButton from './buttons/ClaimButton'

//dont import these here see notice at the top
// import Avatar from './view/Avatar'
// import UserAvatar from './view/UserAvatar'

export {
  Address,
  AmountInput,
  BigGoodDollar,
  BigNumber,
  ClaimButton,
  CopyButton,
  CustomButton,
  CustomDialog,
  Icon,
  IconButton,
  InputGoodDollar,
  InputRounded,
  InputText,
  LoadingIndicator,
  NumPadKeyboard,
  QRCode,
  SaveButton,
  ScanQRButton,
  ReceiveToAddressButton,
  SendToAddressButton,
  SendToAddress,
  Section,
  ShareButton,
  Text,
  Wrapper,
  AwaitButton,
  WrapperClaim,
}

export type { ButtonProps }
