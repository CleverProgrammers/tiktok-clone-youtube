import { useWallet } from '@solana/wallet-adapter-react'
import MainView from '../components/mainview'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function Home() {
  const { connected } = useWallet()

  return (
    <div className='app'>
      {connected ? (
        <MainView />
      ) : (
        <div className='loginContainer'>
          <div className='loginTitle'>Log in to TikTok</div>
          <div className='loginSubTitle'>
            Manage your account, check notifications, comment on videos, and
            more
          </div>
          <WalletMultiButton />
        </div>
      )}
    </div>
  )
}
