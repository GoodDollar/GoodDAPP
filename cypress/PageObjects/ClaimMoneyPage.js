class ClaimMoneyPage {

    get moneyAmountDiv() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div[2]/div[2]/div/div/div[1]', { timeout: 10000 });
    }

    get image() {
        return cy.xpath('img[src]', { timeout: 10000 }).eq(1);
    }

    get timer() {
        return cy.xpath('//*[@id="root"]/div[1]/div/div[2]/div[2]/div/div/div[2]/div[2]/div[3]/div[2]', { timeout: 10000 });
    }

    get claimButton() {
        return cy.get('[role="button"]', { timeout: 10000 }).eq(2);
    }

}

export default new ClaimMoneyPage;