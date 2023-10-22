"use client";

import { ethers } from "ethers";
import {
  createWeb3Modal,
  defaultConfig,
  useWeb3ModalSigner,
  useWeb3ModalAccount,
} from "@web3modal/ethers5/react";

import { EthersAdapter } from "@safe-global/protocol-kit";
import SafeApiKit from "@safe-global/api-kit";
import { SafeFactory } from "@safe-global/protocol-kit";
import { SafeAccountConfig } from "@safe-global/protocol-kit";
import Safe from "@safe-global/protocol-kit";
import { useState } from "react";
import { SafeTransactionDataPartial, MetaTransactionData } from "@safe-global/safe-core-sdk-types";

export default function Home() {
  const projectId = "491b125a2c55325ef23f2c11955ff58f";

  const chains = [5];
  const metadata = {
    name: "My Website",
    description: "My Website description",
    url: "https://mywebsite.com",
    icons: ["https://avatars.mywebsite.com/"],
  };

  createWeb3Modal({
    ethersConfig: defaultConfig({ metadata }),
    chains,
    projectId,
  });

  const { signer, walletProvider } = useWeb3ModalSigner();
  const { address, chainId, isConnected } = useWeb3ModalAccount();

  console.log("address: ", address, isConnected);

  const [safeAddress, setSafeAddress] = useState<string>();

  let url = process.env.NEXT_PUBLIC_GOERLI_RPC_URL!;
  let provider = new ethers.providers.JsonRpcProvider(url);

  const safeOwner = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY!, provider);

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: safeOwner,
  });

  const txServiceUrl = "https://safe-transaction-goerli.safe.global";
  const safeService = new SafeApiKit({ txServiceUrl, ethAdapter });

  const handleCreateSafeAccount = async () => {
    const safeFactory = await SafeFactory.create({ ethAdapter });

    const safeAccountConfig: SafeAccountConfig = {
      owners: [await safeOwner.getAddress()],
      threshold: 1,
    };
    const safeSdk = await safeFactory.deploySafe({ safeAccountConfig });
    const deployedSafeAddress = await safeSdk.getAddress();

    setSafeAddress(deployedSafeAddress);

    console.log("Your Safe has been deployed:");
    console.log(`https://goerli.etherscan.io/address/${deployedSafeAddress}`);
    console.log(`https://app.safe.global/gor:${deployedSafeAddress}`);
  };

  const handleFundAccount = async () => {
    const safeAmount = ethers.utils.parseUnits("0.01", "ether").toHexString();

    const transactionParameters = {
      to: safeAddress,
      value: safeAmount,
    };

    const tx = await safeOwner.sendTransaction(transactionParameters);

    console.log("Fundraising.");
    console.log(`Deposit Transaction: https://goerli.etherscan.io/tx/${tx.hash}`);
  };

  const handleSafeTransfer = async (event: any) => {
    event.preventDefault();
    console.log("handle");
    const safeAmount = ethers.utils.parseUnits("0.0001", "ether").toString();

    const safeTransactionData: MetaTransactionData[] = [
      {
        to: "0xEaC9eDFE37fA378E8795253d292e6393d29aBCa2",
        data: "0x",
        value: safeAmount,
      },
      {
        to: "0x52D3C6EC3fEFC2752DA794a78B35C4D265E63458",
        data: "0x",
        value: safeAmount,
      },
    ];
    const safeSdk = await Safe.create({
      ethAdapter,
      safeAddress: "0x1F83dBa955B6fd072E56b1c03b67e807D0FC15c3",
    });

    const safeTransaction = await safeSdk.createTransaction({ safeTransactionData });
    console.log("safeTransaction", safeTransaction);
    const txResponse = await safeSdk.executeTransaction(safeTransaction);
    await txResponse.transactionResponse?.wait();
    console.log("txResponse", txResponse);
  };

  return (
    <div>
      <div className="bg-red-700">Main Page</div>
      <div>
        <w3m-button />
      </div>
      <div className="flex justify-center">
        <div>
          <button
            className="m-4 px-4 py-2 font-bold text-white bg-blue-500 rounded-xl hover:bg-blue-700"
            onClick={handleCreateSafeAccount}
          >
            Create Safe Account
          </button>
          <div>
            <button
              className="m-4 px-4 py-2 font-bold text-white bg-blue-500 rounded-xl hover:bg-blue-700"
              onClick={handleFundAccount}
            >
              Fund Your Account
            </button>
          </div>
          <div className="max-w-xs my-2 overflow-hidden rounded shadow-lg">
            <div className="px-6 py-4">
              <div className="mb-2 text-xl font-bold">Transfer funds from your safe account</div>
              <form className="flex flex-col">
                <label htmlFor="name" className="mb-2 italic">
                  Address to
                </label>
                <input className="mb-4 border-b-2" id="name" name="name" type="text" required />
                <button
                  onClick={handleSafeTransfer}
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
