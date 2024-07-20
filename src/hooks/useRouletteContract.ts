import { useEffect, useState } from "react";
import { MainContract } from "../contracts/RouletteContract";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, Cell, OpenedContract } from "ton-core";
import { toNano } from "ton-core";
import { useTonConnect } from "./useTonConnect";

export function useMainContract() {
  const client = useTonClient();

  const { sender } = useTonConnect();
  const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

  const [contractData, setContractData] = useState<null | {
    contributors_count: number;
    recent_sender: Address;
    owner_address: Address;
    addresses: Cell;
  }>();

  const [balance, setBalance] = useState<null | number>(0);

  const mainContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new MainContract(
      Address.parse("EQCpVGvbMFvYq2RSosZipIWc2JBQQi2mOcC_837CuA_LDExZ")
    );
    return client.open(contract) as OpenedContract<MainContract>;
  }, [client]);

  useEffect(() => {
    async function getValue() {
      if (!mainContract) return;
      setContractData(null);
      const val = await mainContract.getData();
      const { balance } = await mainContract.getBalance();
      setContractData({
        contributors_count: val.number,
        recent_sender: val.recent_sender,
        owner_address: val.owner_address,
        addresses: val.addresses(),
      });
      setBalance(balance);
      await sleep(5000); // sleep 5 seconds and poll value again
      getValue();
    }
    getValue();
  }, [mainContract]);

  return {
    contract_address: mainContract?.address.toString(),
    contract_balance: balance,
    ...contractData,
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
      return mainContract?.sendFinishGameRequest(sender, toNano("0.05"));
    },
  };
}