const config = require('../src/config.json')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
  // Fetch accounts from wallets --- these are unlocked
  const accounts = await ethers.getSigners()

  // Fetch network
  const { chainId } = await ethers.provider.getNetwork()
  console.log("Using chainId: ", chainId)

  // Fetch deployed tokens
  const GR8 = await ethers.getContractAt('Token', config[chainId].GR8.address)
  console.log(`GR8 token fetched: ${GR8.address}\n`)

  const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
  console.log(`mETH token fetched: ${mETH.address}\n`)

  const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
  console.log(`mDAI token fetched: ${mDAI.address}\n`)

  // Fetch the deployed exchage
  const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
  console.log(`Exchange fetched: ${exchange.address}\n`)

  // Give tokens to accounts[1]
  const sender = accounts[0]
  const receiver = accounts[1]
  let amount = tokens(10000)

  // user1 transfers 10,000 mETH...
  let transaction, result
  transaction = await mETH.connect(sender).transfer(receiver.address, amount)
  console.log(`Transfered ${amount} tokens from ${sender.address} to ${receiver.address}\n`)

  // Set up exchange users
  const user1 = accounts[0]
  const user2 = accounts[1]
  amount = tokens(10000)

  // user1 approves 10,000 GR8...
  transaction = await GR8.connect(user1).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user1.address}\n`)

  // User1 deposits GR8
  transaction = await exchange.connect(user1).depositToken(GR8.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} tokens from ${user1.address}\n`)

  // user2 approves mETH...
  transaction = await mETH.connect(user2).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user2.address}`)

  // User2 deposits mETH
  transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} tokens from ${user2.address}\n`)

  ///////////////////////////////////////////////////////
  // Seed cancelled order
  //

  // User 1 makes order to get tokens
  let orderId
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), GR8.address, tokens(5))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  // User 1 cancels order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).cancelOrder(orderId)
  result = await transaction.wait()
  console.log(`Cancelled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  ///////////////////////////////////////////////////////
  // Seed filled order
  //

  // User 1 makes order to get tokens
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), GR8.address, tokens(10))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  // User 2 fills order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  // User 1 makes another order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), GR8.address, tokens(15))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  // User 2 fills another order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  // User 1 makes final order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), GR8.address, tokens(20))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  // User 2 fills final order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  ///////////////////////////////////////////////////////
  // Seed open orders
  //

  // User 1 makes 10 order
  for(let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(i*10), GR8.address, tokens(10))
    await transaction.wait()

    console.log(`Made order from ${user1.address}`)

    // Wait 1 second
    await wait(1)
  }

  // User 2 makes 10 order
  for(let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user2).makeOrder(GR8.address, tokens(10), mETH.address, tokens(i*10))
    await transaction.wait()

    console.log(`Made order from ${user2.address}`)
    
    // Wait 1 second
    await wait(1)
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
