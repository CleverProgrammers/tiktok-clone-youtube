import MusicNoteIcon from '@material-ui/icons/MusicNote'
import Image from 'next/image'
import style from '../styles/Footer.module.css'

function Footer({ channel, description, song }) {
  return (
    <div className={style.footer}>
      <div className={style.footerText}>
        <h3>@{channel}</h3>
        <p>{description}</p>
        <div className={style.footerTicker}>
          <MusicNoteIcon className={style.footerIcon} />
          <p>&nbsp; &nbsp; &nbsp; {song}</p>
        </div>
      </div>
      <div className={style.footerRecord}>
        <Image
          src='https://static.thenounproject.com/png/934821-200.png'
          alt='vinyl record'
          width={50}
          height={50}
        />
      </div>
    </div>
  )
}

export default Footer
