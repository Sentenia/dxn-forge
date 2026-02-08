// src/config/appkit.js
// Must be imported BEFORE App renders (top of main.jsx)

import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { sepolia } from '@reown/appkit/networks';

const projectId = 'aa0b9fb53b2b8c54a3dd03332aee3f68';

const metadata = {
  name: 'DXN Forge',
  description: 'Stake DXN. Earn GOLD. Burn XEN.',
  url: 'https://www.dxnforge.com',
  icons: ['https://www.dxnforge.com/logo.png'],
};

createAppKit({
  adapters: [new EthersAdapter()],
  networks: [sepolia],
  defaultNetwork: sepolia,
  projectId,
  metadata,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#f5a623',
    '--w3m-border-radius-master': '2px',
  },
  features: {
    email: false,
    socials: false,
    analytics: false,
  },
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
  ],
});