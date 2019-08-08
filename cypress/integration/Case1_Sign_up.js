import StartPage from '../PageObjects/StartPage'
import SignUpPage from '../PageObjects/SignUpPage'




describe('Test case 1: Ability to Sign Up', () => {


    it('Try to login the wallet with wrong values', () => {
        
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


})