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
    recent_sender,
    owner_address,
    addresses,
    sendIncrement,
    sendDeposit,
    sendWithdrawalRequest,
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
          <br/>
          <b>recent_sender Address</b>
          <div className='Hint'>{recent_sender}</div>
          <br/>
          <b>owner_address Address</b>
          <div className='Hint'>{owner_address}</div>
          <br/>
          <b>Participants:</b>
          <div className='Hint'>{addresses}</div>
          <b>Our contract Balance</b>
          {contract_balance && (
            <div className='Hint'>{fromNano(contract_balance)}</div>
          )}
          <br/>
          <b>is_timer_started</b>
          <div className='Hint'>{is_timer_started != null ? Number(is_timer_started ?? false) : "loading..."}</div>
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
              sendIncrement();
            }}
          >
            Increment by 5 (not working)
          </a>
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
              sendWithdrawalRequest();
            }}
          >
            Send withdrowal request 0.7 TON
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
