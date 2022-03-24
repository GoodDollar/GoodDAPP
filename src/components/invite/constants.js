import Config from '../../config/config'
const { isCryptoLiteracy } = Config

export const shareTitle = 'I signed up to GoodDollar. Join me.'
export const shareMessage = isCryptoLiteracy
  ? `If you believe in economic inclusion and the distribution of prosperity for all, then I invite you to sign up for GoodDollar and start collecting your daily digital UBI.
  \nUse my invite link and receive an extra <reward> G$ bonus:\n\n`
  : `If you believe in economic inclusion and the distribution of prosperity for all, then I invite you to sign up for GoodDollar and start collecting your daily digital UBI.
  \nUse my invite link and receive an extra <reward> G$ bonus:\n\n`

export const shortShareMessage =
  'Hi,\nIf you believe in economic inclusion and distribution of prosperity for all, sign up for a GoodDollar wallet and start collecting daily digital income. Use my invite link and receive an extra <reward>G$\n\n'
