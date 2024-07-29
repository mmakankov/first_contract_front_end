import { useEffect, useState } from "react";
import { MainContract } from "../contracts/RouletteContract";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract } from "ton-core";
import { toNano } from "ton-core";
import { useTonConnect } from "./useTonConnect";

export function useMainContract() {
  const client = useTonClient();

  const { sender } = useTonConnect();
  const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

  const [contractData, setContractData] = useState<null | {
    is_timer_started: boolean;
    contributors_count: number;
    last_winner: string;
    owner_address: string;
    timer_address: string;
    addresses: string;
    bets: string;
    total_sum: number;
    timer_end_date: string;
  }>();

  const [balance, setBalance] = useState<null | number>(0);

  const mainContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new MainContract(
      Address.parse("EQCE57glbW7nQNr0c7hPWSvVw9DW31-A43F3XJzYySBocMmF")
    );
    return client.open(contract) as OpenedContract<MainContract>;
  }, [client]);

  useEffect(() => {
    async function getValue() {
      if (!mainContract) return;
      setContractData(null);
      const val = await mainContract.getData();
      var addressesString = "null";
      if (val.addresses != null) {
        addressesString = val.addresses.toString();
      }
      var betsString = "null";
      if (val.bets != null) {
        betsString = val.bets.toString();
      }
      setContractData({
        is_timer_started: val.is_timer_started,
        contributors_count: val.number,
        last_winner: val.last_winner.toString(),
        owner_address: val.owner_address.toString(),
        timer_address: val.timer_address.toString(),
        addresses: addressesString,
        bets: betsString,
        total_sum: val.total_sum,
        timer_end_date: (new Date(val.timer_end_date * 1000)).toString(),
      });
      const { balance } = await mainContract.getBalance();
      setBalance(balance);
      await sleep(5000); // sleep 5 seconds and poll value again
      getValue();
    }
    getValue();
  }, [mainContract]);

  return {
    contract_address: mainContract?.address.toString(),
    contract_balance: balance,
    is_timer_started: contractData?.is_timer_started,
    contributors_count: contractData?.contributors_count,
    last_winner: contractData?.last_winner,
    owner_address: contractData?.owner_address,
    timer_address: contractData?.timer_address,
    addresses: contractData?.addresses,
    bets: contractData?.bets,
    total_sum: contractData?.total_sum,
    timer_end_date: contractData?.timer_end_date,
    sendNewOwnerAddress: (ownerAddress: string) => {
      return mainContract?.sendNewOwnerAddress(sender, toNano("0.05"), Address.parse(ownerAddress));
    },
    sendNewTimerAddress: (timerAddress: string) => {
      return mainContract?.sendNewTimerAddress(sender, toNano("0.05"), Address.parse(timerAddress));
    },
    sendDeposit: () => {
      return mainContract?.sendDeposit(sender, toNano("0.1"));
    },
    sendFinishGameRequest: () => {
      return mainContract?.sendFinishGameRequest(sender, toNano("0.06"));
    },
  };
}