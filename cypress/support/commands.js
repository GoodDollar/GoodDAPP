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
Cypress.Commands.add('iframe', { prevSubject: 'element' }, $iframe => {
    return new Cypress.Promise(resolve => {
        $iframe.on('load', () => {
            resolve($iframe.contents().find('body'));
        });
    });
});

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
