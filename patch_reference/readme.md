# web3-onboard/core patch notes 2.2.1

In case of updates to the @web3-onboard/core library the patch needs to be re-created or re-applied.

very minor patch, it only adds a part attribute to the shadow-dom of the connect-modal
(only way to fix blurry logo)

So in case of an update to @web3-onboard/core check if the update fixes this or that the patch is still needed.
reference to the changes can be found in /patches/@web3-onboard+core+2.2.1.patch 

steps to test if its broken or working:
1. Click on 'Connect a wallet'
2. Top right logo should be clear

steps to re-apply patch when no update for web3-onboard/core:
run `yarn patch-package`

steps to recreate patch when @web3-onboard/core is updated but issue persists:
1. replace files in @web3-onboard/core with the changes listed above
2. run `yarn patch-package @web3-onboard/core`