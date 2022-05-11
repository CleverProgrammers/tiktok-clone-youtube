import { AiFillHome, AiOutlineCompass } from 'react-icons/ai'
import { IoIosAdd } from 'react-icons/io'
import { BiMessageMinus } from 'react-icons/bi'
import { BsPerson } from 'react-icons/bs'
import style from '../styles/BottomBar.module.css'

const BottomBar = ({ setNewVideoShow, getTiktoks }) => {
  return (
    <div className={style.wrapper}>
      <AiFillHome className={style.bottomIcon} />
      <AiOutlineCompass className={style.bottomIcon} onClick={getTiktoks} />
      <div className={style.addVideoButton}>
        <IoIosAdd
          className={style.bottomIcon}
          onClick={() => setNewVideoShow(true)}
          style={{ color: 'black' }}
        />
      </div>
      <BiMessageMinus className={style.bottomIcon} />
      <BsPerson className={style.bottomIcon} />
    </div>
  )
}

export default BottomBar
