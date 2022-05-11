import style from '../styles/UploadModal.module.css'
const UploadModal = ({
  description,
  videoUrl,
  newVideo,
  setDescription,
  setVideoUrl,
  setNewVideoShow,
}) => {
  return (
    <div className={style.wrapper}>
      <div className={style.title}>Upload New Video</div>
      <div className={style.inputField}>
        <div className={style.inputTitle}>Description</div>
        <div className={style.inputContainer}>
          <input
            className={style.input}
            type='text'
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
      </div>
      <div className={style.inputField}>
        <div className={style.inputTitle}>Video Url</div>
        <div className={style.inputContainer}>
          <input
            className={style.input}
            type='text'
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
          />
        </div>
      </div>
      <div className={style.modalButtons}>
        <button
          onClick={() => setNewVideoShow(false)}
          className={`${style.button} ${style.cancelButton}`}
        >
          Cancel
        </button>
        <button
          onClick={newVideo}
          className={`${style.button} ${style.createButton}`}
        >
          Create New
        </button>
      </div>
    </div>
  )
}

export default UploadModal
