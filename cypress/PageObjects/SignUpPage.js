class SignUpPage {
    
    get pageHeader() {
        return cy.get('h1[role=heading]');
    }

    get nameInput() {
        return cy.get('#Name_input');
    }

    get phoneInput() {
        return cy.get('#Phone_input');
    }

    get nextButton() {
        return cy.get('div[role=button]').eq(2);
    }

    get emailInput() {
        return cy.get('#Email_input')
    }

    get invalidValueErrorDiv() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div/div/div/div/div[1]/div/div[2]/div/div[2]');
    }

    get errorOkayButton() { 
        return cy.xpath('//*[@id="root"]/div[3]/div/div/div/div/div[2]/div[2]/div/div[3]/div/div');
    }

    get codeInputs() {
        return cy.get('input[type=tel]')
    }

}

export default new SignUpPage;