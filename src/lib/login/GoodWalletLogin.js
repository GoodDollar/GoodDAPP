// @flow
import ethUtils from "ethereumjs-util"
import LoginService from "./LoginService";
import type { Credentials } from "./LoginService"
import {default as wallet,GoodWallet} from "../wallet/GoodWallet"

export class GoodWalletLogin extends LoginService {

  wallet:GoodWallet

  constructor(wallet:GoodWallet) {
    super();
    this.wallet = wallet
  }  

  async login():Promise<Credentials> {
    const toSign = "Login to GoodDAPP";

    const signature = await this.wallet.sign(toSign)
    
    const creds = { publicKey: this.wallet.account, "signature":signature };
    
    console.log("returning creds",{creds})
  
    return creds

  }
  
}

export default new GoodWalletLogin(wallet)

