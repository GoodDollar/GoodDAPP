/* eslint-disable no-undef */
class InvitePage {
  get pageHeader() {
    return cy.get('h1[role="heading"]')
  }

  get iframe() {
    return cy.getIframeBody('iframe[title="Rewards"]')
  }

  get inviteFriends() {
    return 'h1'
  }

  get inviteShareLink() {
    return 'h4'
  }

  get container() {
    return '.Dashboard'
  }

  get buttonCopy() {
    return '.Button-orange'
  }

  get popupClipBoardCard() {
    return '.ClipBoardCard'
  }

  get iconWhatApp() {
    return '[social="whatsapp"]'
  }

  get iconFB() {
    return '[social="facebook"]'
  }

  get iconTwitter() {
    return '[social="twitter"]'
  }

  get iconLI() {
    return '[social="linkedin"]'
  }

  get iconGmail() {
    return '[social="gmail"]'
  }
}

export default new InvitePage()
