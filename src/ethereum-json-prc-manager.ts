export interface EthereumRequestArguments {
    id: string | number;
    method: string;
    params?: any;
}

export interface EthereumProvider {
    request(args: EthereumRequestArguments): Promise<any>;
    enable(args: EthereumRequestArguments): Promise<any>;
}

export class EthereumJsonRpcManager {
    private readonly eventsListener: (e: MessageEvent) => void;

    constructor(
        private iframe: HTMLIFrameElement,
        private ethereumProvider: EthereumProvider
    ) {
        this.eventsListener = event => {
            if (event.data.jsonrpc === '2.0') {
                this.processRequest(event.data);
            }
        };

        window.addEventListener('message', this.eventsListener);
    }

    destroy() {
        window.removeEventListener('message', this.eventsListener);

        this.iframe.parentElement?.removeChild(this.iframe);
    }

    processRequest(request: EthereumRequestArguments): Promise<void> {
        if (!this.ethereumProvider) {
            return Promise.resolve();
        }

        const request$ = request.method === 'enable'
            ? this.ethereumProvider.enable(request)
            : this.ethereumProvider.request(request);

        const contentWindow = this.iframe.contentWindow!;

        return request$.then(result => {
            contentWindow.postMessage({
                jsonrpc: '2.0',
                id: request.id,
                result
            }, '*');
        }).catch(error => {
            contentWindow.postMessage({
                jsonrpc: '2.0',
                id: request.id,
                error
            }, '*');
        });
    }
}
