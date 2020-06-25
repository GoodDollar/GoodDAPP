/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import HomePage from '../PageObjects/HomePage'
import SignUpPage from '../PageObjects/SignUpPage'
import GDls from '../fixtures/GDls.json'

describe('Test case 2.2: using localStorage', () => {
  beforeEach('load localStorage', () => {
    Object.keys(GDls).forEach(key => {
      localStorage.setItem(key, GDls[key])
    })
  })

  it('login with localStorage value', () => {
    StartPage.open()
    HomePage.waitForHomePageDisplayed()
    HomePage.optionsButton.click()
    HomePage.logoutButton.click()
  })

  it('login with localStorage value again', () => {
    StartPage.open()
    SignUpPage.nameInput.should('not.be.visible')
    HomePage.waitForHomePageDisplayed()
    HomePage.sendButton.should('be.visible')
  })
})