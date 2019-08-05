import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import EditProfilePage from '../PageObjects/EditProfilePage'
import ProfilePage from '../PageObjects/ProfilePage';



describe('Test case 2: Profile editing', () => {

    beforeEach('authorization', () => {     
        StartPage.open();
        StartPage.loginLink.click();  
        
        const wordsForSuccessfullLogin = Cypress.env('wordsForSuccessfullLogin')
        for( let i = 0; i < 12; i++ ) {
            LoginPage.mnemonicInputs.eq(i).type(wordsForSuccessfullLogin[i]);
        }
        LoginPage.recoverWalletButton.click();
        cy.wait(5000)
    });


    it('Elements are present', () => {

        HomePage.profileAvatar.should('be.visible');
        HomePage.sendButton.should('be.visible');
        HomePage.claimButton.should('be.visible');
        HomePage.receiveButton.should('be.visible');

        HomePage.optionsButton.click( {force: true} );
        for( let i = 0; i < 7; i++) {
            HomePage.options.eq(i).should('be.visible');
        }
        HomePage.options.eq(0).click();
        ProfilePage.EditProfileButton.click();
        EditProfilePage.pageHeader.should('contain', 'Edit Profile');
        EditProfilePage.nameInput.should('be.visible');
        EditProfilePage.phoneInput.should('be.visible');
        EditProfilePage.emailInput.should('be.visible');    
        EditProfilePage.avatarDiv.should('be.visible');
        EditProfilePage.saveButton.should('be.visible');   

    }); 

    it('User is able to upload avatar', () => {

        HomePage.profileAvatar.click();
        ProfilePage.avatarDiv.click();

        const selector = 'input[type="file"]';
        const fixturePath = 'smile.png';
        const type = 'image/png';

        cy.get(selector)
            .then(subject => cy.window()
            .then(win => cy.fixture(fixturePath, 'base64')
                .then(Cypress.Blob.base64StringToBlob)
                .then((blob) => {
                    const el = subject[0]
                    const testFile = new win.File([blob], name, { type })
                    const dataTransfer = new win.DataTransfer()
                    dataTransfer.items.add(testFile)
                    el.files = dataTransfer.files
                    cy.wrap(subject).trigger('change', { force: true })}
                )
            )
        )
        .then(()=>cy.get('canvas').should('have.length', 1));
        EditProfilePage.saveAvatarButton.click();
        EditProfilePage.uploadedAvatar.should('be.visible')
        EditProfilePage.uploadedAvatar.click();
        EditProfilePage.selectAvatarButton.click();
        EditProfilePage.clearAvatarButton.click();
        EditProfilePage.saveAvatarButton.click();

    });

    it.only('User is able to edit input fields', () => {

        HomePage.optionsButton.click({force:true});
        HomePage.options.eq(0).click();
        ProfilePage.EditProfileButton.click({force:true});
        cy.wait(5000)
        EditProfilePage.nameInput.clear();
        EditProfilePage.nameInput.type('Username');
        EditProfilePage.saveButton.click({force:true});

    }); 

    // it.only('Negative cases', () => {

    // });


  

})