import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'

import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { useMemo } from 'react'
import { SOLANA_HOST } from '../utils/const'

const WalletConnectionProvider = ({ children }) => {
  const endpoint = useMemo(() => SOLANA_HOST, [])

  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default WalletConnectionProvider
