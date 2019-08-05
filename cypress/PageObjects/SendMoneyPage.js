class SendMoneyPage {

    get nameInput() {
        return cy.get('input[placeholder="Enter the recipient name"]', { timeout: 10000 })
    }

    get messageInput() {
        return cy.get('input[placeholder="Add a message"]', { timeout: 10000 })
    }

    get nextButton() {
        return cy.get('div[role=button]', { timeout: 10000 }).contains('Next')
    }

    get oneButton() {
        return cy.get('div[data-focusable="true"]', { timeout: 10000 }).contains('1')
    }

    get confirmButton() {
        return cy.get('div[role=button]', { timeout: 10000 }).contains('Confirm')
    }

    get copyLinkButton() {
        return cy.get('div[role=button]', { timeout: 10000 }).contains('Copy link to clipboard')
    }

    get doneButton() {
        return cy.get('div[role=button]', { timeout: 10000 }).contains('Done')
    }

}

export default new SendMoneyPage