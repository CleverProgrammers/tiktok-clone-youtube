import Image from 'next/image'
import heartOutlined from '../assets/heartOutlined.svg'
import style from '../styles/CommentsCard.module.css'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'

TimeAgo.addDefaultLocale(en)

const timeAgo = new TimeAgo('en-US')

const CommentCard = ({ username, timestamp, avatar, comment }) => {
  return (
    <div className={style.wrapper}>
      <div>
        <Image
          width={34}
          height={34}
          className={style.avatar}
          src={avatar}
          alt={username}
        />
      </div>
      <div className={style.textContainer}>
        <div>
          <p className={style.username}>{username}</p>
          <p className={style.commentText}>{comment}</p>
          <div>
            <span>
              {timeAgo.format(new Date(timestamp * 1000), 'twitter-now')}
            </span>
          </div>
        </div>
        <div className={style.button}>
          <div>
            <Image width={24} height={24} src={heartOutlined.src} alt='heart' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommentCard
