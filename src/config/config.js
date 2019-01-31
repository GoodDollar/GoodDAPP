const Config = {
    "env":"development",
    "GoodServer":"http://localhost:3003",
    "infura_key": process.env.REACT_APP_INFURA_KEY,
    "ethereum":{
      "42":{
        "network_id":42,
        "web3Transport":"WebSocket",
        "httpWeb3provider":"https://kovan.infura.io/v3/",
        "websocketWeb3Provider":"wss://kovan.infura.io/ws"
      },
      "3":{
        "network_id":3,
        "web3Transport":"WebSocket",
        "httpWeb3provider":"https://ropsten.infura.io/v3/",
        "websocketWeb3Provider":"wss://ropsten.infura.io/ws"
      }

    }
}
export default Config
