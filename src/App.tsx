import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
// import { useMainContract } from "./hooks/useMainContract";
import { useMainContract } from "./hooks/useRouletteContract";
import { useTonConnect } from "./hooks/useTonConnect";
import { fromNano } from "ton-core";
import WebApp from "@twa-dev/sdk";

function App() {
  const {
    contract_address,
    contract_balance,
    is_timer_started,
    contributors_count,
    last_winner,
    owner_address,
    timer_address,
    addresses,
    bets,
    total_sum,
    timer_end_date,
    sendNewOwnerAddress,
    sendNewTimerAddress,
    sendDeposit,
    sendFinishGameRequest,
  } = useMainContract();

  const { connected } = useTonConnect()

  const showAlert = () => {
    WebApp.showAlert("Hey there!");
  };

  return (
    <div>
      <div>
        <TonConnectButton />
      </div>
      <div>
        <div className='Card'>
          <b>{WebApp.platform}</b>
          <br/>
          <b>Our contract Address</b>
          <div className='Hint'>{contract_address?.slice(0, 64)}</div>
          <b>last_winner Address</b>
          <div className='Hint'>{last_winner}</div>
          <b>owner_address Address</b>
          <div className='Hint'>{owner_address}</div>
          <b>timer_address Address</b>
          <div className='Hint'>{timer_address}</div>
          <b>Participants:</b>
          <div className='Hint'>{addresses}</div>
          <b>Bets:</b>
          <div className='Hint'>{bets}</div>
          <b>Our contract Balance</b>
          {contract_balance && (
            <div className='Hint'>{fromNano(contract_balance)}</div>
          )}
          <b>is_timer_started</b>
          <div className='Hint'>{is_timer_started != null ? Number(is_timer_started ?? false) : "loading..."}</div>
          <b>total_sum</b>
          <div className='Hint'>{total_sum ?? "loading..."}</div>
          <b>timer_end_date</b>
          <div className='Hint'>{timer_end_date ?? "loading..."}</div>
        </div>

        <div className='Card'>
          <b>contributors_count Value</b>
          <div>{contributors_count ?? "Loading..."}</div>
        </div>

        <br/>

        <a
          onClick={() => {
            showAlert();
          }}
        >
          Show Alert
        </a>

        <br />

        {connected && (
          <a
            onClick={() => {
              var input = document.getElementById('newOwnerAddressInput') as HTMLInputElement;
              sendNewOwnerAddress(input.value);
            }}
          >
            Change owner
          </a>
        )}
        {connected && (
          <input id="newOwnerAddressInput" type="text" name="newOwnerAddressInput"></input>
        )}

        <br />
        {connected && (
          <a
            onClick={() => {
              var input = document.getElementById('newTimerAddressInput') as HTMLInputElement;
              sendNewTimerAddress(input.value);
            }}
          >
            Change timer address
          </a>
        )}
        {connected && (
          <input id="newTimerAddressInput" type="text" name="newTimerAddressInput"></input>
        )}

        <br/> 
        {connected && (
          <a
            onClick={() => {
              sendDeposit();
            }}
          >
            Send Deposit 0.1 TON and connect to the game
          </a>
        )}

        <br/>
        {connected && (
          <a
            onClick={() => {
              sendFinishGameRequest();
            }}
          >
            Finish game! and receive the prize
          </a>
        )}
      </div>
    </div>
  );
}

export default App;
