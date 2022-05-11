import { createContext, useEffect, useState } from 'react'
import axios from 'axios'
const anchor = require('@project-serum/anchor')
import { useWallet } from '@solana/wallet-adapter-react'

export const TikTokContext = createContext()

export const TikTokProvider = ({ children }) => {
  const [hasPhantom, setHasPhantom] = useState(true)
  const [connected, setConnected] = useState(false)
  const [phantom, setPhantom] = useState()
  const [tiktoks, setTikToks] = useState([])

  useEffect(() => {
    ;(async () => {
      const data = await getTiktoks()

      setTikToks(data)
    })()
    console.log(tiktoks)
  }, [])

  const getTiktoks = async () => {
    console.log('fetching')

    const res = await axios.get(
      'https://ipfs.io/ipfs/QmS28E89P3Gz2LZimkKSuJgXGuZEtXG6dhyzxkSbpv6mKU/tiktoks.json',
    )

    return res.data
  }

  const connectPhantomWallet = () => {
    phantom.connect()
  }

  const signup = async (username, profile) => {
    if (!connected) {
      alert('Connect wallet first')
      return
    }

    const wallet = useWallet()
    const connection = new anchor.web3.Connection(SOLANA_HOST)

    const program = getProgramInstance(connection, wallet)

    let [user_pda] = await anchor.web3.PublicKey.findProgramAddress(
      [utf8.encode('user'), wallet.publicKey.toBuffer()],
      program.programId,
    )

    try {
      const userInfo = await program.account.userAccount.fetch(user_pda)
      console.log(userInfo)
    } catch (e) {}
  }

  useEffect(() => {
    let _phantom

    if (!window['solana']) {
      setHasPhantom(false)
      setConnected(false)
      return
    }

    if (window['solana'].isPhantom) {
      setPhantom(window['solana'])
      _phantom = window['solana']
    }

    _phantom.on('connect', () => {
      console.warn('phantom wallet connected🔥')
      setConnected(true)
    })
  }, [phantom])

  return (
    <TikTokContext.Provider
      value={{
        connected,
        connectPhantomWallet,
        hasPhantom,
        tiktoks,
        signup,
      }}
    >
      {children}
    </TikTokContext.Provider>
  )
}
