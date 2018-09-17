import * as React from 'react';


export class CopyText extends React.PureComponent {
    readonly state = {} as any;
    readonly props: IProps;

    showText = () => {
        
    }

}

interface IProps {
    getText: () => Promise<string>;
    iconClass?: string;
    isHidden?: boolean;
    canCopy?: boolean;
    onCopy?: () => void;
    confirmed?: boolean;
}
