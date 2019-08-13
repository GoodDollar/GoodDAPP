import StartPage from '../PageObjects/StartPage'
import SignUpPage from '../PageObjects/SignUpPage'
import { Wallet } from 'web3-eth-accounts';




describe('Test case 1: Ability to Sign Up', () => {


    it('Try to sign up the wallet with wrong values', () => {
        
       StartPage.open();
       StartPage.createWalletButton.click();
       SignUpPage.pageHeader.should('contain', 'Sign Up');
       SignUpPage.nameInput.should('be.visible');
       SignUpPage.nextButton.should('be.visible');
       SignUpPage.nameInput.type('Name');
       SignUpPage.invalidValueErrorDiv.should('contain', 'Please add first and last name');
       SignUpPage.nameInput.clear();
       SignUpPage.nameInput.type('Name1 Name');
       SignUpPage.invalidValueErrorDiv.should('contain', 'A-Z letter only, no numbers, no symbols');
       SignUpPage.nameInput.clear();

       SignUpPage.nameInput.type('Name Name');
       cy.wait(5000)
       SignUpPage.nextButton.click();
       SignUpPage.phoneInput.type('+38098361132');
       SignUpPage.invalidValueErrorDiv.should('contain', 'Please enter a valid phone format');
       SignUpPage.phoneInput.clear();
       SignUpPage.phoneInput.type('+3809836113200');
       SignUpPage.invalidValueErrorDiv.should('contain', 'Please enter a valid phone format');
       SignUpPage.phoneInput.clear();
       SignUpPage.phoneInput.type('38098361132');
       SignUpPage.invalidValueErrorDiv.should('contain', 'Please enter a valid phone format');

    });

    it.only('Try to sign up the wallet with correct values', async () => {

        await StartPage.open();
        StartPage.createWalletButton.click();
        SignUpPage.nameInput.type('Name Name');
        SignUpPage.nextButton.click();
        SignUpPage.phoneInput.type('+79313107495');
        SignUpPage.nextButton.click();
        cy.wait(5000);
        SignUpPage.errorOkayButton.click();
        SignUpPage.nextButton.click();
        const win = await cy.window();
        const identifierValue = win.wallet.getAccountForType('login');
        cy.log("loooog: " + Object.keys(win))
        cy.log('wall: ' + win.wallet.account)

        cy.request({
                    method: 'POST', 
                    url: 'https://good-qa.herokuapp.com/admin/user/get', 
                    headers: { 
                        'content-type': 'application/json'
                    },
                    body: { 
                        password:'MashWzP8Kg',
                        identifier: identifierValue
                    }}
                    ).then( response => {
                        const body = response.body
                        cy.log('loooog: ' + Object.keys(body)  )
                    });
                



    });


})



