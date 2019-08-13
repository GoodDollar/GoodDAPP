import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import EditProfilePage from '../PageObjects/EditProfilePage'
import ProfilePage from '../PageObjects/ProfilePage';




describe('Test case 3: Ability to change user data', () => {

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


    it('Elements are present at user profile', () => {

        HomePage.profileAvatar.should('be.visible');
        HomePage.sendButton.should('be.visible');
        HomePage.claimButton.should('be.visible');
        HomePage.receiveButton.should('be.visible');

        HomePage.optionsButton.click( {force: true} );
        for( let i = 0; i < 8; i++) {
            HomePage.options.eq(i).should('be.visible');
        }
        HomePage.options.eq(0).click();   
        ProfilePage.editProfileButton.click();  
        EditProfilePage.pageHeader.should('contain', 'Edit Profile');
        EditProfilePage.nameInput.should('be.visible');
        EditProfilePage.phoneInput.should('be.visible');
        EditProfilePage.emailInput.should('be.visible');    
        EditProfilePage.avatarDiv.should('be.visible');
        EditProfilePage.saveButton.should('be.visible');   

    }); 

    it('User is able to upload avatar', () => {

        HomePage.profileAvatar.click();
        ProfilePage.avatarDiv.click({multiple: true});

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
        .then(()=>cy.get('canvas').should('be.visible', 1));
        EditProfilePage.saveAvatarButton.click();
        EditProfilePage.uploadedAvatar.should('be.visible')
        EditProfilePage.uploadedAvatar.click();
        EditProfilePage.selectAvatarButton.click();
        EditProfilePage.clearAvatarButton.click();
        EditProfilePage.saveAvatarButton.click();

    });

    it.only('User is able to edit input fields', () => {

        HomePage.optionsButton.click({force:true});
        HomePage.options.eq(0).click({force:true});
        cy.wait(3000);
        ProfilePage.editProfileButton.click({force:true, timeout:10000});
        cy.wait(3000);

        EditProfilePage.nameInput.clear({timeout:10000});
        EditProfilePage.phoneInput.clear({timeout:10000});
        EditProfilePage.emailInput.clear({timeout:10000});
        EditProfilePage.nameInput.type('Random12345', {force: true});
        EditProfilePage.phoneInput.type('+380983611323', {force: true});
        EditProfilePage.emailInput.type('gggggooddollar.test123@gmail.com', {force: true});


        cy.wait(5000);
        EditProfilePage.saveButton.click();
        cy.wait(5000);


        ProfilePage.nameInput.should('have.value', 'Random12345');
        ProfilePage.phoneInput.should('have.value', '+380983611323');
        ProfilePage.emailInput.should('have.value', 'gggggooddollar.test123@gmail.com');


        ProfilePage.editProfileButton.click();
        cy.wait(3000);
        EditProfilePage.nameInput.clear();
        EditProfilePage.nameInput.type('AndrewLebowski123'); 
        EditProfilePage.phoneInput.clear();  
        EditProfilePage.phoneInput.type('+380983611320');
        EditProfilePage.emailInput.clear();
        EditProfilePage.emailInput.type('gooddollar.test123@gmail.com');
        cy.wait(3000)
        EditProfilePage.saveButton.click();
        cy.wait(7500)

    }); 

    it('User is unable to type invalid data', () => {

        HomePage.optionsButton.click({force:true});
        HomePage.options.eq(0).click({force:true});
        cy.wait(3000);
        ProfilePage.editProfileButton.click();
        cy.wait(3000);

        EditProfilePage.nameInput.clear({timeout:10000});
        EditProfilePage.phoneInput.clear({timeout:10000});
        EditProfilePage.emailInput.clear({timeout:10000});
        EditProfilePage.nameInput.type('Random Username', {force: true});
        EditProfilePage.phoneInput.type('+999999999999', {force: true});
        EditProfilePage.emailInput.type('incorrect@email', {force: true});

        EditProfilePage.wrongNameErrorDiv.should('contain', 'Must contain only letters (a-z), numbers (0-9) and underscore (_)');
        EditProfilePage.phoneInput.should('have.class', 'react-phone-number-input__input--invalid')
        EditProfilePage.wrongEmailErrorDiv.should('contain', 'Enter a valid format: yourname@example.com');

        EditProfilePage.saveButton.should('not.be.enabled');

    });


});
