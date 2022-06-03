type GaData = {
  event: string,
  action: string,
  type?: string,
  amount?: string,
  tokens?: [string | undefined, string | undefined]
}

export default function sendGa(data: GaData): void {
  const { event, action, type, amount, tokens} = data
  if (window.dataLayer){
    const trackData = {event: event, action: action, type: type, amount: amount, tokens: tokens}
    const output = JSON.parse(JSON.stringify(trackData))
    window.dataLayer.push(output)
  }
  
  return 
}