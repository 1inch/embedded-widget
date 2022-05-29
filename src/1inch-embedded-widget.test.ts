import {OneInchWidgetOptions, setup1inchWidget} from './1inch-embedded-widget';
import {EthereumIframeJsonRpcManager, EthereumProvider} from './ethereum-iframe-json-prc-manager';
import {instance, mock} from 'ts-mockito';

describe('setup1inchWidget', () => {
    let ethereumProvider: EthereumProvider;

    beforeEach(() => {
        ethereumProvider = mock<EthereumProvider>();
    });

    it('Should setup iframe with correct url', () => {
        const host = document.createElement('div');

        const options: OneInchWidgetOptions = {
            chainId: 137,
            sourceTokenSymbol: '1INCH',
            destinationTokenSymbol: 'DAI',
            hostElement: host,
            provider: instance(ethereumProvider),
            theme: 'light',
            sourceTokenAmount: '15'
        };

        const rpcManager = setup1inchWidget(options);

        expect(rpcManager).toBeInstanceOf(EthereumIframeJsonRpcManager);
        expect(host.innerHTML).toMatchSnapshot();
    });
});
