/* eslint-disable no-undef */
class StatisticsPage {
  get headerPage() {
    return cy.get('[role="heading"]')
  }

  get iframe() {
    return cy.getIframeBody('iframe[title="Statistics"]')
  }

  get burgerButton() {
    return 'button[type="button"]'
  }

  get dashboardButton() {
    return '[role="button"]'
  }

  get container() {
    return '.MuiGrid-container'
  }
}

export default new StatisticsPage()
