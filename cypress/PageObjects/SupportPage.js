class SupportPage {

    get pageHeader() {
        return cy.get('h1[role=heading]', { timeout: 10000 })
    }

    get optionsButton() {
        return cy.get('a[href="#"]', { timeout: 10000 })
    }

    get iframe() {
        return cy.get('iframe[src="https://community.gooddollar.org/support/"]', { timeout: 10000 })
    }

    get helpFormEmail() {
        return '#mauticform_input_communitygdsupportrequestform_email';
    }

    get helpFormTextArea() {
        return '#mauticform_input_communitygdsupportrequestform_your_support_request';
    }

    get submitHelpFormButton() {
        return '#mauticform_input_communitygdsupportrequestform_submit';
    }

    get footerLinks() {
        return cy.get('#footer a', { timeout: 10000 })
    }
    
    get headerLinks() {
        return cy.get('.menu-item', { timeout: 10000})
    }

    

  
}

export default new SupportPage