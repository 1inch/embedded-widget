import {EthereumIframeJsonRpcManager, EthereumProvider} from './ethereum-iframe-json-prc-manager';

const defaultOneInchOrigin = 'https://app.1inch.io';
const iframeId = 'oneInchWidgetFrame';

export interface OneInchWidgetOptions {
    chainId: number;
    sourceTokenSymbol: string;
    destinationTokenSymbol: string;
    hostElement: HTMLElement;
    provider: EthereumProvider;
    theme?: 'light' | 'dark';
    oneInchOrigin?: string;
    sourceTokenAmount?: string;
}

export function setup1inchWidget(options: OneInchWidgetOptions): EthereumIframeJsonRpcManager {
    const {
        hostElement,
        provider,
        chainId,
        sourceTokenAmount,
        sourceTokenSymbol,
        destinationTokenSymbol,
        oneInchOrigin,
        theme
    } = options;

    const iframe = document.createElement('iframe');
    const query = new URLSearchParams({
        sourceTokenAmount: sourceTokenAmount || '',
        theme: theme || ''
    });
    const origin = oneInchOrigin || defaultOneInchOrigin;
    const existedFrame = document.getElementById(iframeId);

    iframe.id = iframeId;
    iframe.src = `${origin}/#/${chainId}/embedded-swap/${sourceTokenSymbol}/${destinationTokenSymbol}?${query}`;
    if (existedFrame) {
        hostElement.removeChild(existedFrame);
    }
    hostElement.appendChild(iframe);

    return new EthereumIframeJsonRpcManager(iframe, provider);
}
