import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import ProfileEditPage from '../PageObjects/ProfileEditPage';



describe('Test case 2: Profile editing', () => {

    beforeEach('authorization', () => {     
        StartPage.open();
        StartPage.loginLink.click();  
        
        const wordsForSuccessfullLogin = Cypress.env('wordsForSuccessfullLogin')
        for( let i = 0; i < 12; i++ ) {
            LoginPage.mnemonicInputs.eq(i).type(wordsForSuccessfullLogin[i]);
        }
        LoginPage.recoverWalletButton.click();
    });


    it('Elements are present at the home page', () => {

        HomePage.homePageIdentificator.should('be.visible');
        for( let i = 1; i < 7; i++) {
            HomePage.interactableElements.eq(i).should('be.visible');
        }
        HomePage.optionsButton.click( {force: true} );
        for( let i = 0; i < 7; i++) {
            HomePage.options.eq(i).should('be.visible');
        }

    });

    it('Able to upload avatar', () => {

        HomePage.profileAvatar.click();
        ProfileEditPage.profileSettingsButton.click();
        ProfileEditPage.header.should('contain', 'Edit Profile');
        ProfileEditPage.nameInput.should('be.visible');
        ProfileEditPage.phoneInput.should('be.visible');
        ProfileEditPage.emailInput.should('be.visible');        

        
    });


  

})