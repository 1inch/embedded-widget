function initApp() {
    let ethereumJsonRpcManager;
    let ethereumProvider;

    const widgetHost = document.getElementById('widgetHost');
    const connectWalletButton = document.getElementById('connectWalletButton');
    const disconnectWalletButton = document.getElementById('disconnectWalletButton');
    const updateButton = document.getElementById('updateButton');

    const Web3Modal = window.Web3Modal.default;
    const providerOptions = {
        walletconnect: {
            package: window.WalletConnectProvider.default,
            options: {
                rpc: {
                    1: 'https://web3-node.1inch.io',
                    56: 'https://bsc-dataseed.binance.org',
                    137: 'https://polygon-rpc.com',
                    10: 'https://mainnet.optimism.io',
                    42161: 'https://arb1.arbitrum.io/rpc',
                    100: 'https://rpc.xdaichain.com',
                    43114: 'https://api.avax.network/ext/bc/C/rpc',
                    250: 'https://rpc.ftm.tools',
                }
            }
        },
    };
    const web3Modal = new Web3Modal({
        network: 'mainnet',
        cacheProvider: true,
        theme: 'dark',
        providerOptions
    });

    web3Modal.on('connect', provider => {
        const formState = getFormState();

        ethereumProvider = provider;

        const init$ = ethereum.request({method: 'eth_chainId'})
            .then(chainId => +chainId)
            .then(chainId => {
                const isChainIdMatch = +formState.chainId === +chainId;

                return isChainIdMatch
                    ? null
                    : switchNetwork(formState.chainId);
            });

        init$.then(() => {
            initWidget(formState);
            setConnectedUiState();
        });
    });

    if (web3Modal.cachedProvider) {
        web3Modal.connect();
    } else {
        setDisconnectedUiState();
    }

    bindUiEvents(web3Modal);

    /**********************************************************************/

    function initWidget(formState) {
        if (ethereumJsonRpcManager) {
            ethereumJsonRpcManager.destroy();
        }

        ethereumJsonRpcManager = oneInch.setup1inchWidget({
            ...formState,
            hostElement: widgetHost,
            provider: ethereumProvider
        });

        widgetHost.classList.remove('active');

        ethereumJsonRpcManager.onIframeLoad(() => {
            widgetHost.classList.add('active');
        });
    }

    function bindUiEvents(web3Modal) {
        let formState = getFormState();

        updateButton.addEventListener('click', function(event) {
            event.preventDefault();

            const newFormState = getFormState();
            const isNetworkChanged = formState.chainId !== newFormState.chainId;
            const init$ = isNetworkChanged
                ? switchNetwork(newFormState.chainId)
                : Promise.resolve();

            init$.then(() => {
                initWidget(newFormState);
            });
        });

        connectWalletButton.addEventListener('click', function() {
            web3Modal.updateState({show: true});
        });

        disconnectWalletButton.addEventListener('click', function() {
            setDisconnectedUiState();
            localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
            localStorage.removeItem('walletconnect');
            ethereumJsonRpcManager && ethereumJsonRpcManager.destroy();
        });
    }

    function setConnectedUiState() {
        connectWalletButton.style.display = 'none';
        disconnectWalletButton.style.display = '';
    }

    function setDisconnectedUiState() {
        connectWalletButton.style.display = '';
        disconnectWalletButton.style.display = 'none';
        widgetHost.classList.remove('active');
    }

    function getFormState() {
        const optionsForm = document.getElementById('optionsForm');

        return Object.fromEntries(new FormData(optionsForm));
    }

    function switchNetwork(chainId) {
        return ethereumProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${(+chainId).toString(16)}` }],
        });
    }
}
