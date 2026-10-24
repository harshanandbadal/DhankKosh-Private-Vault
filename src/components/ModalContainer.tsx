"use client";

import React from "react";
import CreateBankAccountModal from "./modals/CreateBankAccountModal";
import CreateCreditCardModal from "./modals/CreateCreditCardModal";
import CreatePhysicalAssetModal from "./modals/CreatePhysicalAssetModal";
import CreateP2PAccountModal from "./modals/CreateP2PAccountModal";
import CreateGiftCardModal from "./modals/CreateGiftCardModal";
import NewTransactionModal from "./modals/NewTransactionModal";
import P2PLedgerTransactionModal from "./modals/P2PLedgerTransactionModal";
import QuickBankTxModal from "./modals/QuickBankTxModal";
import UserSettingsModal from "./modals/UserSettingsModal";

export default function ModalContainer({
  vaultData,
}: {
  vaultData?: {
    user?: any;
    bankAccounts?: any[];
    creditCards?: any[];
    physicalAssets?: any[];
    p2pContacts?: any[];
    giftCards?: any[];
  };
}) {
  return (
    <>
      <CreateBankAccountModal />
      <CreateCreditCardModal existingCards={vaultData?.creditCards} />
      <CreatePhysicalAssetModal />
      <CreateP2PAccountModal />
      <CreateGiftCardModal bankAccounts={vaultData?.bankAccounts} />
      <NewTransactionModal
        bankAccounts={vaultData?.bankAccounts}
        creditCards={vaultData?.creditCards}
        physicalAssets={vaultData?.physicalAssets}
      />
      <P2PLedgerTransactionModal
        p2pContacts={vaultData?.p2pContacts}
        bankAccounts={vaultData?.bankAccounts}
        physicalAssets={vaultData?.physicalAssets}
        giftCards={vaultData?.giftCards}
      />
      <QuickBankTxModal bankAccounts={vaultData?.bankAccounts} />
      <UserSettingsModal user={vaultData?.user} />
    </>
  );
}
