const config = {
    "env":"development",
    "GoodServer":"http://localhost:3003",
    "ethereum":{
      "42":{
        "network_id":42,
        "web3Transport":"HttpProvider",
        "httpWeb3provider":"https://kovan.infura.io/v3/",
        "websocketWeb3Provider":"wss://kovan.infura.io/ws"
      },
      "3":{
        "network_id":3,
        "web3Transport":"HttpProvider",
        "httpWeb3provider":"https://ropsten.infura.io/v3/",
        "websocketWeb3Provider":"wss://ropsten.infura.io/ws"
      }

    }
}

export default config