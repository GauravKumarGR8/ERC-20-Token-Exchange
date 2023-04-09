async function main() {
  console.log(`Preparing deployment....\n`)

  //Fetch contract to deploy
  const Token = await ethers.getContractFactory('Token')
  const Exchange = await ethers.getContractFactory('Exchange')

  // Fetch accounts
  const accounts = await ethers.getSigners()

  console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}`)

  //Deploy Contract
  const gr8 = await Token.deploy('GauravGR8', 'GR8', '1000000')
  await gr8.deployed()
  console.log(`GR8 deployed to: ${gr8.address}`)

  const mETH = await Token.deploy('Mock ETH', 'mETH', '1000000')
  await mETH.deployed()
  console.log(`mETH deployed to: ${mETH.address}`)

  const mDAI = await Token.deploy('Mock Dai', 'mDAI', '1000000')
  await mDAI.deployed()
  console.log(`mDAI deployed to: ${mDAI.address}`)

  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed()
  console.log(`Exchange deployed to: ${exchange.address}`)

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
