# web3-onboard/core patch notes 2.2.5

In case of updates to the @web3-onboard/core library the patch needs to be re-created or re-applied.

very minor patch, it only adds a part attribute to the shadow-dom of the connect-modal
(only way to fix blurry logo)

So in case of an update to @web3-onboard/core check if the update fixes this or that the patch is still needed.
reference to the changes can be found in /patches/@web3-onboard+core+2.2.5.patch 

steps to test if its broken or working:
1. Click on 'Connect a wallet'
2. Top right logo should be clear

steps to re-apply patch when no update for web3-onboard/core:
run `yarn patch-package`

(dev-note: creating a patch the regular way does not work with Yarn Berry. Ref:https://github.com/ds300/patch-package/issues/272))
steps to recreate patch when @web3-onboard/core is updated but issue persists:
either run ./patch-package.sh <package-name> (unix) or manually >
1. create tmp dir (outside repo)
2. yarn init -y (make sure it uses Yarn v1)
3. yarn add @web3-onboard/core@{version}
4. make relevant changes
5. run `yarn patch-package @web3-onboard/core`
6. copy over patch file and run patch-package (applying and post-install still works)