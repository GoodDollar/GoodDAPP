import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import EditProfilePage from '../PageObjects/EditProfilePage'
import ProfilePage from '../PageObjects/ProfilePage'
import ProfilePrivacyPage from '../PageObjects/ProfilePrivacyPage'




describe('Test case 5: Ability to change profile privacy level', () => {

    before('authorization', () => {     
        StartPage.open();
        StartPage.loginLink.click();       
        const wordsForSuccessfullLogin = Cypress.env('wordsForSuccessfullLogin')
        for( let i = 0; i < 12; i++ ) {
            LoginPage.mnemonicInputs.eq(i).type(wordsForSuccessfullLogin[i]);
        }
        LoginPage.recoverWalletButton.click();
        cy.wait(7000)
    });


    it('User should be able to change privacy lvl', () => {

        HomePage.profileAvatar.should('be.visible')
        HomePage.profileAvatar.click();
        ProfilePage.phoneInput.should('have.value', '+380983611320');
        ProfilePage.emailInput.should('have.value', 'gooddollar.test123@gmail.com');

        ProfilePage.profilePrivacyButton.click();
        cy.wait(7000)
        ProfilePrivacyPage.pageHeader.should('contain', 'PROFILE PRIVACY');

        ProfilePrivacyPage.muskedNumberButton.click();
        ProfilePrivacyPage.muskedEmailButton.click();
        ProfilePrivacyPage.saveButton.click();
        ProfilePrivacyPage.backButton.click();

        ProfilePage.phoneInput.should('have.value', '*********1320');
        ProfilePage.emailInput.should('have.value', 'g****************3@gmail.com');
        ProfilePage.profilePrivacyButton.click();

        ProfilePrivacyPage.privateNumberButton.click();
        ProfilePrivacyPage.privateEmailButton.click();
        ProfilePrivacyPage.saveButton.click();
        ProfilePrivacyPage.backButton.click();

        ProfilePage.phoneInput.should('have.value', '******');
        ProfilePage.emailInput.should('have.value', '******');
        ProfilePage.profilePrivacyButton.click();

        ProfilePrivacyPage.publicNumberButton.click();
        ProfilePrivacyPage.publicEmailButton.click();
        ProfilePrivacyPage.saveButton.click();

    });

})