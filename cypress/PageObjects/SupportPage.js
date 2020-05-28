/* eslint-disable no-undef */
class SupportPage {
  get pageHeader() {
    return cy.get('[data-testid="rewards_header"]', { timeout: 10000 })
  }

  get iframe() {
    return cy.get('iframe[title=" Support & Feedback"]')
  }

  get search() {
    return '#search'
  }

  get topics() {
    return '#topics'
  }

  get ask() {
    return '#ask-a-question'
  }

  get helpFormFirstName() {
    return '#mauticform_input_communitygdsupportrequestform_first_name'
  }

  get helpFormLastName() {
    return '#mauticform_input_communitygdsupportrequestform_last_name'
  }

  get helpFormEmail() {
    return '#mauticform_input_communitygdsupportrequestform_email'
  }

  get helpFormTextArea() {
    return '#mauticform_input_communitygdsupportrequestform_your_support_request'
  }

  get submitHelpFormButton() {
    return '#mauticform_input_communitygdsupportrequestform_submit'
  }

  get helpFormSuccessMessage() {
    return '#mauticform_communitygdsupportrequestform_message'
  }

  get subscribeLinks() {
    return '#footer a'
  }

  get subscribeFormName() {
    return '#mauticform_input_communitygdfooternlregistration_first_name'
  }

  get subscribeFormSurname() {
    return '#mauticform_input_communitygdfooternlregistration_last_name'
  }

  get subscribeFormEmail() {
    return '#mauticform_input_communitygdfooternlregistration_email'
  }

  get submitSubscribeFormButton() {
    return '#mauticform_input_communitygdfooternlregistration_submit'
  }

  get subscribeFormSuccessMessage() {
    return '#mauticform_communitygdfooternlregistration_message'
  }
}

export default new SupportPage()
