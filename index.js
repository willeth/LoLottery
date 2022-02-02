import LoLottery from './artifacts/contracts/LoLottery.sol/LoLottery';
import {address} from './__config';
import {ethers} from 'ethers';
import Web3Modal from "web3modal";
import "./index.css";
import WalletConnectProvider from "@walletconnect/web3-provider";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "INFURA_ID" // required
    }
  }
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions // required
});

var signer;
var provider;
var instance;


setInterval(listenForPlayers,2000);

async function connectProvider(){

  try {

  
    instance = await web3Modal.connect();

    provider = new ethers.providers.Web3Provider(instance);

  }

  catch(err){

    console.error("cannot connect to network")

  }


}

connectProvider();

/* connect wallet function attempt to connect to the wallet of user, if the user is the owner
a new game will be created or played depending on the state of the contract*/
async function connectWallet(){

    try {

  
          signer = provider.getSigner();

          const container = document.querySelector("#signup");
          const signerAddress = await signer.getAddress();
          const signerAddressString = signerAddress.toString().slice(0,15);
          container.innerHTML = `${signerAddressString}...`

          const contract = new ethers.Contract(address, LoLottery.abi, signer);
          
          if(signer.address === contract.owner){

              try{ 
                  const gameInProgress = await contract.gameInProgress;
                  await contract.newGame(100, ethers.utils.parseEther("0.01"));
              }
              
              catch(err){
                  console.error("Game in progress");
              }

              try{
                  await contract.playGame();
              }

              catch(err){
                  console.error("Game not full")
              }
              

          }

    }

    catch (err){ 
    
        console.error("No wallet connected")
      
    }

}



async function joinGame() {
  
  try{

        const contract = new ethers.Contract(address, LoLottery.abi, signer);
        await contract.enterGame( {value: ethers.utils.parseEther("0.01")});

  }

  catch(err){

        console.error("No game in progress");

  }

}



document.querySelector("#signup").addEventListener("click", connectWallet);
document.querySelector("#playNowButton").addEventListener("click", joinGame);



// Show active menu when scrolling
const highlightMenu = () => {
  const elem = document.querySelector('.highlight');
  const homeMenu = document.querySelector('#home-page');
  const aboutMenu = document.querySelector('#about-page');
  const servicesMenu = document.querySelector('#services-page');
  let scrollPos = window.scrollY;
  // console.log(scrollPos);

  // adds 'highlight' class to my menu items
  if (window.innerWidth > 960 && scrollPos < 600) {
    homeMenu.classList.add('highlight');
    aboutMenu.classList.remove('highlight');
    return;
  } else if (window.innerWidth > 960 && scrollPos < 1400) {
    aboutMenu.classList.add('highlight');
    homeMenu.classList.remove('highlight');
    servicesMenu.classList.remove('highlight');
    return;
  } else if (window.innerWidth > 960 && scrollPos < 2345) {
    servicesMenu.classList.add('highlight');
    aboutMenu.classList.remove('highlight');
    return;
  }

  if ((elem && window.innerWIdth < 960 && scrollPos < 600) || elem) {
    elem.classList.remove('highlight');
  }
};

window.addEventListener('scroll', highlightMenu);
window.addEventListener('click', highlightMenu);



function build(tick, no, cur, add, gn, lw){

      const contract = new ethers.Contract(address, LoLottery.abi, provider);
      const etherPrize = ethers.utils.formatEther(tick);
      var playerAddressString;
 
      return `
        
              <div class="main__container">
              <div class="main__content">
              <h1>Ticket Entry ${etherPrize} ether <br> Prize Total 0.09 Ether <br> Game number ${gn} </h1>

                <h2>Players ${cur} out of ${no}</h2>
                
                <p><br><br>Player Addresses</p>
                <p>${add}</p>
                <p><br><br>Last Winner</p>
                <p><br><br>${lw}</p>
                </div></div>
              `;

    }

async function listenForPlayers() {
  
  try{
  
  
        const contract = new ethers.Contract(address, LoLottery.abi, provider);
        const game = await contract.game();
        const ticketCost = await game.ticketPrice;
        const totalPlayers = await game.numberOfPlayers;
        const currentNumberOfPlayers = await contract.getCurrentNumberOfPlayers();
        const lastWinner = await contract.lastWinner();
        const gameNumber = await contract.gameNumber();
        let string = "";
        var currentAddress;
  
  
        for(let i = 0; i<currentNumberOfPlayers; i++){
          
          currentAddress = await contract.getPlayerByIndex(i);
          string = string + " <br> " + currentAddress;
        
        }
        
  
        const container = document.querySelector("#about");
        container.innerHTML = build(ticketCost, totalPlayers, currentNumberOfPlayers, string, gameNumber, lastWinner);


        contract.on("gameCreated", async(_numberOfPlayers, _ticketPrice) => {
          
          const container = document.querySelector("#about");
          container.innerHTML = build().join("");
        
        });

  }

  
  
  catch(err){
      
    console.error("No players or Game");
  
  }

}





