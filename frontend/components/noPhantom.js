import Link from 'next/link'

const NoPhantom = () => {
  return (
    <div className='app'>
      <div className='noPhantomContainer'>
        Your browser does not support phantom wallet <br />
        Please install Phantom from{' '}
        <Link passHref={true} href='https://phantom.app/'>
          here
        </Link>
      </div>
    </div>
  )
}

export default NoPhantom
