import { useEffect, useState } from 'react'
import FavoriteIcon from '@material-ui/icons/Favorite'
import MessageIcon from '@material-ui/icons/Message'
import ShareIcon from '@material-ui/icons/Share'
import { useWallet } from '@solana/wallet-adapter-react'
import style from '../styles/Sidebar.module.css'

function Sidebar({
  likes,
  shares,
  messages,
  onShowComments,
  likeVideo,
  index,
  likesAddress,
}) {
  const [liked, setLiked] = useState(false)
  const wallet = useWallet()

  useEffect(() => {
    if (wallet.connected) {
      likesAddress.forEach(address => {
        if (wallet.publicKey.toBase58() === address.toBase58()) {
          setLiked(true)
        }
      })
    }
  }, [wallet, likesAddress])

  return (
    <div className={style.sidebar}>
      <div className={style.sidebarButton}>
        {liked ? (
          <FavoriteIcon
            fontSize='large'
            style={{ fill: 'red', stroke: 'red' }}
          />
        ) : (
          <FavoriteIcon
            fontSize='large'
            onClick={e => {
              likeVideo(index)
            }}
          />
        )}
        <p>{likes}</p>
      </div>
      <div className={style.sidebarButton} onClick={onShowComments}>
        <MessageIcon fontSize='large' />
        <p>{messages}</p>
      </div>
      <div className={style.sidebarButton}>
        <ShareIcon fontSize='large' />
        <p>{shares}</p>
      </div>
    </div>
  )
}

export default Sidebar
