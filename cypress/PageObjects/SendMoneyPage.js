import { chain, values } from 'lodash'

/* eslint-disable no-undef */
class SendMoneyPage {
  get waitButtonRegex() {
    return /OK, I’ll WAIT/i
  }

  get sendMoneyLinkRegex() {
    return /(?:http[s]?:\/\/)[^\s[",><]*/gim
  }

  get nameInput() {
    return cy.get('input[placeholder="Enter the recipient name"]', { timeout: 10000 })
  }

  get messageInput() {
    return cy.get('input[placeholder="Add a message"]', { timeout: 10000 })
  }

  get nextButton() {
    return cy.get('div[role=button]', { timeout: 10000 }).contains('Next')
  }

  get moneyInput() {
    return cy.get('input[placeholder="0 G$"]', { timeout: 10000 })
  }

  get confirmButton() {
    return cy.contains('Confirm', { timeout: 10000 })
  }

  get copyLinkButton() {
    return cy.contains('COPY LINK TO CLIPBOARD')
  }

  get doneButton() {
    return cy.contains('Done')
  }

  get dailyClaimText() {
    return cy.contains('Daily Share')
  }

  get claimButton() {
    return cy.get('[role="button"]').eq(1)
  }

  get verifyButton() {
    return cy.get('[role="button"]').contains('OK, VERIFY ME')
  }

  get readyButton() {
    return cy.contains('I\'M READY')
  }

  get yayButton() {
    return cy.contains(/YAY!/i)
  }

  get allButtons() {
    return cy
      .get('div[role=button]')
      .then(Array.from)
  }

  get hasWaitButton() {
    const { waitButtonRegex, allButtons } = this

    return allButtons.then(buttons => chain(buttons)
      .map('textContent')
      .some(text => waitButtonRegex.test(text))
      .value()
    )
  }

  get waitButton() {
    const { waitButtonRegex, allButtons} = this

    return allButtons.then(buttons => chain(buttons)
      .filter({ textContent } => waitButtonRegex.test(textContent))
      .first()
      .value()
    )
  }

  get alreadyUsedText() {
    return cy.contains('Payment already withdrawn or canceled by sender')
  }

  get cancelButton() {
    return cy.get('[role="button"]').contains('Cancel link')
  }

  get sendAddressButton() {
    return cy.contains('Send to address')
  }

  get addressInput() {
    return cy.get('input[placeholder="Enter Wallet Address"]')
  }

  get errorAddressText() {
    return cy.contains('Invalid wallet address')
  }

  get errorMoneyText() {
    return cy.contains(/Sorry, you don't have enough G/i)
  }

  get sendingText() {
    return cy.contains(/YOU ARE SENDING/i)
  }
}

export default new SendMoneyPage()
