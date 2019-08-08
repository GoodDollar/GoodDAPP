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
        cy.wait(5000)
    });


    it('User should be able to change privacy lvl', () => {

        HomePage.profileAvatar.click();
        ProfilePage.phoneInput.should('have.value', '+380685953834');
        ProfilePage.emailInput.should('have.value', 'andrey.holenkov@qatestlab.eu');

        ProfilePage.profilePrivacyButton.click();
        cy.wait(7000)
        ProfilePrivacyPage.pageHeader.should('contain', 'PROFILE PRIVACY');

        ProfilePrivacyPage.muskedNumberButton.click();
        ProfilePrivacyPage.muskedEmailButton.click();
        ProfilePrivacyPage.saveButton.click();
        ProfilePrivacyPage.backButton.click();

        ProfilePage.phoneInput.should('have.value', '*********3834');
        ProfilePage.emailInput.should('have.value', 'a*************v@qatestlab.eu');
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