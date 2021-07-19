import Web3 from "web3";
import { Currency, CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import { BigNumber, ethers } from "ethers";

import { tokenBalance } from "../utils/tokenBalance";
import { ContributionCalcContract } from "../contracts/ContributionCalcContract";

const AZ = ethers.constants.AddressZero

/**
 * Calculated exit contribution for an account.
 * @param {Web3} web3 Web3 instance.
 * @param {CurrencyAmount} G$Currency Amount of G$Currency account wants to sell.
 * @param {string} account Account's address.
 * @return {CurrencyAmount} Exit contribution ratio.
 */
export async function calculateExitContribution(web3: Web3, G$Currency: CurrencyAmount<Currency>, account: string): Promise<Fraction> {
  const goodReserveCDai = await ContributionCalcContract(web3)

  console.log('-------- Exit contribution START')
  console.log('G$', G$Currency.toFixed(2))
  const GDXCurrency = await tokenBalance(web3, 'GDX', account)
  console.log('GDX', GDXCurrency.toFixed(2))

  const G$CurrencyDiscount = G$Currency.subtract(G$Currency.lessThan(GDXCurrency) ? G$Currency : GDXCurrency)
  console.log('G$ Discount', G$CurrencyDiscount.toFixed(2))

  if (G$CurrencyDiscount.equalTo(0)) {
    console.log('-------- Exit contribution END')
    return new Fraction(0)
  }

  const contributionRaw = await goodReserveCDai.methods.calculateContribution(AZ, AZ, AZ, AZ, G$CurrencyDiscount.multiply(G$CurrencyDiscount.decimalScale).toExact()).call() as BigNumber

  console.log('-------- Exit contribution END')
  return new Fraction(contributionRaw.toString(), G$Currency.decimalScale)
}
