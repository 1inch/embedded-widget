import {EthereumJsonRpcManager, EthereumProvider} from './ethereum-json-prc-manager';
import {deepEqual, instance, mock, verify, when} from 'ts-mockito';

describe('EthereumJsonRpcManager', () => {
    let iframe: HTMLIFrameElement;
    let ethereumProvider: EthereumProvider;
    let contentWindow: Window;

    beforeEach(() => {
        iframe = mock<HTMLIFrameElement>();
        ethereumProvider = mock<EthereumProvider>();
        contentWindow = mock<Window>();

        when(iframe.contentWindow).thenCall(() => instance(contentWindow));
    });

    it('Call the enable method', () => {
        const ethereumJsonRpcManager = new EthereumJsonRpcManager(
            instance(iframe),
            instance(ethereumProvider)
        );
        const request = {
            id: 1,
            method: 'enable',
        };

        when(ethereumProvider.enable(deepEqual(request))).thenResolve();
        ethereumJsonRpcManager.processRequest(request);

        verify(ethereumProvider.enable(deepEqual(request))).once();
    });

    it('Call any other method', async () => {
        const ethereumJsonRpcManager = new EthereumJsonRpcManager(
            instance(iframe),
            instance(ethereumProvider)
        );
        const request = {
            id: 1,
            method: 'eth_chainId',
        };

        when(ethereumProvider.request(deepEqual(request))).thenResolve(56);

        await ethereumJsonRpcManager.processRequest(request);

        verify(contentWindow.postMessage(deepEqual({
            jsonrpc: '2.0',
            id: request.id,
            result: 56
        }), '*')).once();
    });

    it('Should send error to window', async () => {
        const ethereumJsonRpcManager = new EthereumJsonRpcManager(
            instance(iframe),
            instance(ethereumProvider)
        );
        const request = {
            id: 1,
            method: 'eth_chainId',
        };
        const error = new Error();

        when(ethereumProvider.request(deepEqual(request))).thenReject(error);

        await ethereumJsonRpcManager.processRequest(request);

        verify(contentWindow.postMessage(deepEqual({
            jsonrpc: '2.0',
            id: request.id,
            error
        }), '*')).once();
    });

    it('Destroy instance', async () => {
        const ethereumJsonRpcManager = new EthereumJsonRpcManager(
            instance(iframe),
            instance(ethereumProvider)
        );
        const parent = mock<HTMLElement>();

        when(iframe.parentElement).thenCall(() => instance(parent));

        ethereumJsonRpcManager.destroy();

        verify(parent.removeChild(instance(iframe))).once();
    });
});
