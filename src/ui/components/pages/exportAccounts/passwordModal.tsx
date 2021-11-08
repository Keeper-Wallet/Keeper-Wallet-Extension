import * as styles from './passwordModal.styl';
import cn from 'classnames';
import * as React from 'react';
import { Modal } from 'ui/components/ui/modal/Modal';
import { Trans } from 'react-i18next';
import { Input } from 'ui/components/ui/input';
import { Error } from 'ui/components/ui/error';
import { Button } from 'ui/components/ui/buttons/Button';

interface Props {
    onClose: () => void;
    onSubmit: (password: string) => Promise<void>;
}

export function ExportAccountsPasswordModal({ onClose, onSubmit }: Props) {
    const passwordInputRef = React.useRef<Input | null>(null);
    const [password, setPassword] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);

    React.useLayoutEffect(() => {
        passwordInputRef.current.focus();
    }, []);

    return (
        <Modal animation={Modal.ANIMATION.FLASH} showModal>
            <div className="modal cover">
                <form
                    className="modal-form"
                    onSubmit={async (event) => {
                        event.preventDefault();
                        setPasswordError(false);

                        try {
                            await onSubmit(password);
                        } catch {
                            setPasswordError(true);
                        }
                    }}
                >
                    <i className={cn(styles.lockIcon, 'lock-icon')} />

                    <p className={cn('margin1', 'body1', 'disabled500')}>
                        <Trans i18nKey="exportKeystore.passwordVerifyDesc" />
                    </p>

                    <div className="margin2 relative">
                        <div className="basic500 tag1 input-title">
                            <Trans i18nKey="exportKeystore.passwordLabel" />
                        </div>

                        <Input
                            className="margin1"
                            data-testid="passwordInput"
                            error={passwordError}
                            ref={passwordInputRef}
                            type="password"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.currentTarget.value);
                            }}
                        />

                        <Error show={passwordError}>
                            <div className="error">
                                <Trans i18nKey="exportKeystore.passwordError" />
                            </div>
                        </Error>
                    </div>

                    <p className={cn('margin2', 'body1', 'disabled500')}>
                        <Trans
                            components={{ attention: <strong className="error500" /> }}
                            i18nKey="exportKeystore.passwordVerifyImportantNote"
                        />
                    </p>

                    <Button data-testid="verifyButton" disabled={!password} className="margin1" type="submit">
                        <Trans i18nKey="exportKeystore.verifyBtn" />
                    </Button>

                    <Button onClick={onClose}>
                        <Trans i18nKey="exportKeystore.cancelBtn" />
                    </Button>
                </form>
            </div>
        </Modal>
    );
}
