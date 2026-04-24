/**
 * Deploy script for MirrorPersona contract on Base.
 * Uses Hardhat + ethers.js.
 *
 * Usage:
 *   npx hardhat run contracts/deploy.ts --network base
 *   npx hardhat run contracts/deploy.ts --network base-sepolia
 */

import { ethers } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying with:', deployer.address)
  console.log('Balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'ETH')

  const MirrorPersona = await ethers.getContractFactory('MirrorPersona')
  const contract = await MirrorPersona.deploy()
  await contract.waitForDeployment()

  const address = await contract.getAddress()
  console.log('\n✅ MirrorPersona deployed to:', address)
  console.log('Network:', (await ethers.provider.getNetwork()).name)
  console.log('\nAdd to .env:')
  console.log(`NEXT_PUBLIC_MIRROR_CONTRACT_ADDRESS=${address}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
