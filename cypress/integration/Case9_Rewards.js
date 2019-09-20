import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import RewardsPage from '../PageObjects/RewardsPage';




describe('Test case 9: Ability to see rewards', () => {

    before('authorization', () => {     
 
        StartPage.open();
        StartPage.continueOnWebButton.click();   
        StartPage.signInButton.click();  
        LoginPage.recoverFromPassPhraseLink.click();
        LoginPage.pageHeader.should('contain', 'Recover');
        const string = Cypress.env('wordsForSuccessfullLogin').join(' ');
        LoginPage.mnemonicsInput.type(string);
        LoginPage.recoverWalletButton.click();
        LoginPage.yayButton.click();
        cy.wait(7000);
        
    });

    it('User is able to see rewards page correctly (same as dashboard on w3)', () => {

        HomePage.rewardsButton.click();
        RewardsPage.pageHeader.should('contain', 'Rewards');
        RewardsPage.iframe.should('be.visible');
        RewardsPage.iframe
            .then( iframe => new Promise(resolve => setTimeout( () => resolve(iframe), 7500 )))
            .then( iframe => {
                const body = iframe.contents().find('body');

                cy.wrap(body.find(RewardsPage.createWalletButton)).should('be.visible');
                cy.wrap(body.find(RewardsPage.contentWrapper)).should('contain', 'let’s change money, for good!');
        
            });

    })

})