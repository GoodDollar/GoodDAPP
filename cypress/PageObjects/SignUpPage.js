class SignUpPage {
    
    get pageHeader() {
        return cy.get('h1[role=heading]', { timeout: 10000 });
    }

    get nameInput() {
        return cy.get('#Name_input', { timeout: 10000 });
    }

    get phoneInput() {
        return cy.get('#Phone_input', { timeout: 10000 });
    }

    get nextButton() {
        return cy.get('div[role=button]', { timeout: 10000 }).eq(2);
    }

    get invalidValueErrorDiv() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div/div/div/div/div[1]/div/div[2]/div/div[2]', { timeout: 10000 });
    }

    get errorOkayButton() {
        return cy.xpath('//*[@id="root"]/div[3]/div/div/div/div/div[2]/div[2]/div/div[3]/div/div', { timeout: 10000 })
    }
    

}

export default new SignUpPage;