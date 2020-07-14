/* eslint-disable no-undef */
class ProfilePage {
  get pageHeader() {
    return cy.get('h1[role=heading]', { timeout: 10000 })
  }

  get nameInput() {
    return cy.get('input[placeholder="Choose a Username"]', { timeout: 10000 })
  }

  get phoneInput() {
    return cy.get('input[placeholder="Add your Mobile"]', { timeout: 10000 })
  }

  get emailInput() {
    return cy.get('input[placeholder="Add your Email"]', { timeout: 10000 })
  }

  get profilePrivacyButton() {
    return cy.get('[data-focusable]', { timeout: 10000 }).eq(2)
  }

  get editButton() {
    return cy.get('[data-focusable]', { timeout: 10000 }).eq(4)
  }

  get avatarDiv() {
    return cy.get('img[alt]', { timeout: 10000 }).eq(0)
  }

  // ** this button causes react decoder error sometimes ** //
  // get editProfileButton() {
  //   return cy
  //     .get('body')
  //     .find('[style="font-family: gooddollar; font-size: 25px; font-style: normal;"]', { timeout: 10000 })
  // }

  // openEditProfileButton() {
  //   cy.visit(Cypress.env('baseUrl') + 'AppNavigation/Profile/EditProfile')
  //   cy.contains('Profile').should('be.visible')
  // }

  // openProfilePage() {
  //   cy.visit(Cypress.env('baseUrl') + 'AppNavigation/Profile/Profile')
  // }

  uploadUserAvatar() {
    cy.get('body').then($bodys => {
      if ($bodys.find('.r-161ttwi').length > 0) {
        cy.get('.r-161ttwi').click()
      }
    })

    const selector = 'input[type="file"]'
    const fixturePath = 'smile.png'
    const type = 'image/png'
    cy.get(selector)
      .eq(0)
      .then(subject =>
        cy.window().then(win =>
          cy
            .fixture(fixturePath, 'base64')
            .then(Cypress.Blob.base64StringToBlob)
            .then(blob => {
              const el = subject[0]
              const testFile = new win.File([blob], name, { type })
              const dataTransfer = new win.DataTransfer()
              dataTransfer.items.add(testFile)
              el.files = dataTransfer.files
              cy.wrap(subject).trigger('change', { force: true }, { timeout: 8000 })
            })
        )
      )
  }
}

export default new ProfilePage()
