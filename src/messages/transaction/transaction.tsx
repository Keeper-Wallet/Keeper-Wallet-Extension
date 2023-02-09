import { TRANSACTION_TYPE } from '@waves/ts-types';
import { type PreferencesAccount } from 'preferences/types';

import { type MessageOfType } from '../types';
import { AliasCard, AliasScreen } from './alias';
import { BurnCard, BurnScreen } from './burn';
import { CancelLeaseCard, CancelLeaseScreen } from './cancelLease';
import { DataCard, DataScreen } from './data';
import { InvokeScriptCard, InvokeScriptScreen } from './invokeScript';
import { IssueCard, IssueScreen } from './issue';
import { LeaseCard, LeaseScreen } from './lease';
import { MassTransferCard, MassTransferScreen } from './massTransfer';
import { ReissueCard, ReissueScreen } from './reissue';
import { SetAssetScriptCard, SetAssetScriptScreen } from './setAssetScript';
import { SetScriptCard, SetScriptScreen } from './setScript';
import { SponsorshipCard, SponsorshipScreen } from './sponsorship';
import { TransferCard, TransferScreen } from './transfer';
import { UpdateAssetInfoCard, UpdateAssetInfoScreen } from './updateAssetInfo';

export function TransactionCard({
  collapsed,
  message,
}: {
  collapsed?: boolean;
  message: MessageOfType<'transaction'>;
}) {
  switch (message.data.type) {
    case TRANSACTION_TYPE.ISSUE:
      return <IssueCard collapsed={collapsed} tx={message.data} />;
    case TRANSACTION_TYPE.TRANSFER:
      return <TransferCard tx={message.data} />;
    case TRANSACTION_TYPE.REISSUE:
      return <ReissueCard tx={message.data} />;
    case TRANSACTION_TYPE.BURN:
      return <BurnCard tx={message.data} />;
    case TRANSACTION_TYPE.LEASE:
      return <LeaseCard tx={message.data} />;
    case TRANSACTION_TYPE.CANCEL_LEASE:
      return <CancelLeaseCard tx={message.data} />;
    case TRANSACTION_TYPE.ALIAS:
      return <AliasCard tx={message.data} />;
    case TRANSACTION_TYPE.MASS_TRANSFER:
      return <MassTransferCard collapsed={collapsed} tx={message.data} />;
    case TRANSACTION_TYPE.DATA:
      return <DataCard collapsed={collapsed} tx={message.data} />;
    case TRANSACTION_TYPE.SET_SCRIPT:
      return <SetScriptCard collapsed={collapsed} tx={message.data} />;
    case TRANSACTION_TYPE.SPONSORSHIP:
      return <SponsorshipCard collapsed={collapsed} tx={message.data} />;
    case TRANSACTION_TYPE.SET_ASSET_SCRIPT:
      return <SetAssetScriptCard collapsed={collapsed} tx={message.data} />;
    case TRANSACTION_TYPE.INVOKE_SCRIPT:
      return <InvokeScriptCard collapsed={collapsed} tx={message.data} />;
    case TRANSACTION_TYPE.UPDATE_ASSET_INFO:
      return <UpdateAssetInfoCard />;
  }
}

export function TransactionScreen(props: {
  message: MessageOfType<'transaction'>;
  selectedAccount: PreferencesAccount;
}) {
  switch (props.message.data.type) {
    case TRANSACTION_TYPE.ISSUE:
      return <IssueScreen {...props} tx={props.message.data} />;
    case TRANSACTION_TYPE.TRANSFER:
      return <TransferScreen {...props} tx={props.message.data} />;
    case TRANSACTION_TYPE.REISSUE:
      return <ReissueScreen {...props} tx={props.message.data} />;
    case TRANSACTION_TYPE.BURN:
      return <BurnScreen {...props} tx={props.message.data} />;
    case TRANSACTION_TYPE.LEASE:
      return <LeaseScreen {...props} tx={props.message.data} />;
    case TRANSACTION_TYPE.CANCEL_LEASE:
      return <CancelLeaseScreen {...props} tx={props.message.data} />;
    case TRANSACTION_TYPE.ALIAS:
      return <AliasScreen {...props} tx={props.message.data} />;
    case TRANSACTION_TYPE.MASS_TRANSFER:
      return <MassTransferScreen {...props} tx={props.message.data} />;
    case TRANSACTION_TYPE.DATA:
      return <DataScreen {...props} tx={props.message.data} />;
    case TRANSACTION_TYPE.SET_SCRIPT:
      return <SetScriptScreen {...props} tx={props.message.data} />;
    case TRANSACTION_TYPE.SPONSORSHIP:
      return <SponsorshipScreen {...props} tx={props.message.data} />;
    case TRANSACTION_TYPE.SET_ASSET_SCRIPT:
      return <SetAssetScriptScreen {...props} tx={props.message.data} />;
    case TRANSACTION_TYPE.INVOKE_SCRIPT:
      return <InvokeScriptScreen {...props} tx={props.message.data} />;
    case TRANSACTION_TYPE.UPDATE_ASSET_INFO:
      return <UpdateAssetInfoScreen {...props} tx={props.message.data} />;
  }
}
