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
    recent_sender: string;
    owner_address: string;
    addresses: string;
  }>();

  const [balance, setBalance] = useState<null | number>(0);

  const mainContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new MainContract(
      Address.parse("EQCrgT_vSHjsfzRgD9O5oiZ8zNB28T0hAA0ZcQRbF1xT2GZs")
    );
    return client.open(contract) as OpenedContract<MainContract>;
  }, [client]);

  useEffect(() => {
    async function getValue() {
      if (!mainContract) return;
      setContractData(null);
      const val = await mainContract.getData();
      var dictString = "null";
      if (val.addresses != null) {
        // const parsedObject = val.addresses.beginParse();
        // const key: number = 0
        // const dict = parsedObject.loadAddress();
        dictString = val.addresses.toString();
      }
      setContractData({
        is_timer_started: val.is_timer_started,
        contributors_count: val.number,
        recent_sender: val.recent_sender.toString(),
        owner_address: val.owner_address.toString(),
        addresses: dictString,//val.addresses != null ? val.addresses?.bits.toString() : "null",
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
    recent_sender: contractData?.recent_sender,
    owner_address: contractData?.owner_address,
    addresses: contractData?.addresses,
    // ...contractData,
    sendIncrement: () => {
      return mainContract?.sendIncrement(sender, toNano("0.05"), 5);
    },
    sendDeposit: () => {
      return mainContract?.sendDeposit(sender, toNano("0.1"));
    },
    sendWithdrawalRequest: () => {
      return mainContract?.sendWithdrawalRequest(sender, toNano("0.05"), toNano("0.7"));
    },
    sendFinishGameRequest: () => {
      return mainContract?.sendFinishGameRequest(sender, toNano("0.06"));
    },
  };
}