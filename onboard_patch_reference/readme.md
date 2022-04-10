# web3-onboard/core patch notes 2.2.0

In case of updates to the @web3-onboard/core library the patch needs to be re-created or re-applied.

patch is for a user rejecting the connection request when trying to auto-select.
it never clears the walletToAutoSelect, so it requires a user to close modal, and re-open if
user wants to connect a different wallet. No clear messaging is given, and 'back to wallets' button
just re-triggers the autoSelect. 


So in case of an update to @web3-onboard/core check if the update fixes this or that the patch is still needed.
reference to the changes can be found in /patches/@web3-onboard+core+2.2.0.patch 

steps to test if its broken or working:
1. connect a wallet to the app.
2. close window.
3. remove the app from your connected sites in wallet.
4. go back to app.
5. localStorage is set for previouslyConnected wallets, so app tries to connect. 
6. The metamask connecting request pops up so Cancel request.
7. The onboard modal should return to the select wallets window.

steps to re-apply patch when no update for web3-onboard/core:
run `yarn patch-package`

steps to recreate patch when @web3-onboard/core is updated but issue persists:
1. replace files in @web3-onboard/injected-wallets with the changes listed above
2. run `yarn patch-package @web3-onboard/injected-wallets`