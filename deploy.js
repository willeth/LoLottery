const fs = require('fs');

async function main() {
  
  const [accounts] = await ethers.getSigners();
  
  const Token = await ethers.getContractFactory("LoLottery");
  const token = await Token.deploy();

  console.log("Lolottery deployed to:", token.address);

  const config = {
    address: token.address
  }

  fs.writeFileSync("./app/__config.json", JSON.stringify(config, null, 2));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
