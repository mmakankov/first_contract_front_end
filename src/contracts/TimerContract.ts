import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from "ton-core";

export type MainContractConfig = {
  is_timer_started: boolean;
  number: number;
  address: Address;
  owner_address: Address;
  timer_address: Address;
  addresses: Cell;
};

export function mainContractConfigToCell(config: MainContractConfig): Cell {
  return beginCell()
    .storeBit(config.is_timer_started)
    .storeUint(config.number, 32)
    .storeAddress(config.address)
    .storeAddress(config.owner_address)
    .storeAddress(config.timer_address)
    .storeBit(false)
    .endCell();
}

export class MainContract implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromConfig(
    config: MainContractConfig,
    code: Cell,
    workchain = 0
  ) {
    const data = mainContractConfigToCell(config);
    const init = { code, data };
    const address = contractAddress(workchain, init);

    return new MainContract(address, init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async getData(provider: ContractProvider) {
    const { stack } = await provider.get("get_contract_storage_data", []);
    console.log(stack)
    return {
        schedule: stack.readCellOpt(),
        owner: stack.readAddress(),
        caller: stack.readAddress(),
        furthest_schedule: stack.readNumber(),
        timer_bounce_address: stack.readAddress(),
    };
  }

  async sendNewOwnerAddress(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    newOwnerAddress: Address
  ){
    const msg_body = beginCell()
      .storeUint(1, 32) // OP code
      .storeAddress(newOwnerAddress)
      .endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }

  async sendNewCallerAddress(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    newCallerAddress: Address
  ) {
    const msg_body = beginCell()
      .storeUint(2, 32) // OP code
      .storeAddress(newCallerAddress)
      .endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }

  async sendDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
    const msg_body = beginCell()
      .storeUint(3, 32) // OP code
      .endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }

  async sendNoCodeDeposit(
    provider: ContractProvider,
    sender: Sender,
    value: bigint
  ) {
    const msg_body = beginCell().endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }
}