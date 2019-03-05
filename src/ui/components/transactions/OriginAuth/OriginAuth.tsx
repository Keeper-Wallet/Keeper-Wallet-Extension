import * as styles from './originAuth.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { SignClass } from '../SignClass';
import { OriginAuthCard } from './OriginAuthCard';
import { OriginAuthInfo } from './OriginAuthInfo';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { TransactionWallet } from '../../wallets';
import { ApproveBtn, Button, BUTTON_TYPE, CollapsedContent } from 'ui/components/ui';
import { ExtendedPermission } from 'ui/components/permissions';

@translate(I18N_NAME_SPACE)
export class OriginAuth extends SignClass {
    
    getRef = el => this.setState({ el });
    
    render() {
        const { message, assets } = this.props;
        const title = <span className={styles.collapsedTitle}>
            <Trans i18nKey='permissionSettings.modal.title'>
                Permission details
            </Trans>
        </span>;
        
        const { interval, type, totalAmount } = this.state;
        const amount = totalAmount * 10 ** 8;
        const approvePermissions = !this.state.interval || !amount ? null : { origin: message.origin, params: { interval, totalAmount: amount, type } };
        
        return <div className={styles.transaction}>
            <div className={`${styles.originAuthTxScrollBox} transactionContent`} ref={this.getRef}>

                <div className="margin-main margin-main-top headline3 basic500">
                    <Trans i18nKey='transactions.allowAccess'>Allow access</Trans>
                </div>

                <div className="margin-main">
                    <OriginAuthCard {...this.props}/>
                </div>
                
                <OriginAuthInfo message={message} assets={assets}/>
                
                <CollapsedContent className={styles.collapsed} titleElement={title} scrollElement={this.state.el}>
                    <ExtendedPermission className={styles.collapsedContent}
                                        originName={message.origin}
                                        autoSign={null}
                                        onChangePerms={perms => this.setState(perms)}
                    />
                </CollapsedContent>
            </div>
    
            <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
                <Button onClick={this.props.reject} type={BUTTON_TYPE.WARNING}>
                    <Trans i18nKey='sign.reject'>Reject</Trans>
                </Button>
                <ApproveBtn onClick={(e) => this.props.approve(e, approvePermissions)} type={BUTTON_TYPE.SUBMIT}>
                    <Trans i18nKey='sign.auth'>Auth</Trans>
                </ApproveBtn>
    
                <TransactionWallet account={this.props.selectedAccount} onSelect={this.props.selectAccount}/>
            </div>
        </div>
    }
}


