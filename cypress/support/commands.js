/* eslint-disable no-undef */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
// Cypress.Commands.add('iframe', { prevSubject: 'element' }, $iframe => {
//     return new Cypress.Promise(resolve => {
//         $iframe.on('load', () => {
//             resolve(
//                 $iframe.contents().find('body')

//             );
//         });
//     });
// });

// Cypress.Commands.add("checkIframeData", (iframeSelector, ) => {
//     cy.get(iframeSelector)
//         .then((iframe) => new Promise(resolve => setTimeout(() => resolve(iframe), 7500)))
//         .then(function (iframe) {
//             const body = iframe.contents().find('body');

//             // cy.wrap(body.find(ordersPage.nameOnCardValue)).type(creditCard.name);
//             // cy.wrap(body.find(ordersPage.cardNumberValue)).type(creditCard.cardNumber);
//             // cy.wrap(body.find(ordersPage.expirationDateValue)).type(creditCard.expiration);
//             // cy.wrap(body.find(ordersPage.cvV2Value)).type(creditCard.cvv);
//             // cy.wrap(body.find(ordersPage.phoneNumberValue)).type(creditCard.phone);
//             // cy.wrap(body.find(ordersPage.billingAddressValue)).type(creditCard.address);
//             // cy.wrap(body.find(ordersPage.cityValue)).type(creditCard.city);
//             // cy.wrap(body.find(ordersPage.stateValue)).type(`${creditCard.state}{enter}`, {force: true});
//             // cy.wrap(body.find(ordersPage.zipCodeValue)).type(creditCard.zip);
//             // cy.wrap(body.find(ordersPage.addCard)).click();
//         })
// });

// Cypress.Commands.add('iframe', {prevSubject: 'element'}, (iframe) => {
//     const iframeDoc = iframe[0].contentDocument;

//     return new Cypress.Promise(resolve => {
//         const resolveWithBody = () => {
//             resolve(iframe.contents().find('body'))
//         };

//         if ( 'complete' === iframeDoc.readyState ) {
//             resolveWithBody();
//         }

//         iframe.on('load', () => {
//             resolveWithBody();
//         })
//     })
// });

// Cypress.Commands.add('iframe', { prevSubject: 'element' }, ($iframe, selector) => {
//     Cypress.log({
//       name: 'iframe',
//       consoleProps() {
//         return {
//           iframe: $iframe,
//         };
//       },
//     });
//     return new Cypress.Promise(resolve => {
//       resolve($iframe.contents().find(selector));
//     });
//   });
function waitForResourceToLoad(fileName, type) {
  const resourceCheckInterval = 40

  return new Cypress.Promise(resolve => {
    const checkIfResourceHasBeenLoaded = () => {
      const resource = cy
        .state('window')
        .performance.getEntriesByType('resource')
        .filter(entry => !type || entry.initiatorType === type)
        .find(entry => entry.name.includes(fileName))

      if (resource) {
        resolve()
        return
      }
      setTimeout(checkIfResourceHasBeenLoaded, resourceCheckInterval)
    }
    checkIfResourceHasBeenLoaded()
  })
}

Cypress.Commands.add('waitForResourceToLoad', waitForResourceToLoad)
