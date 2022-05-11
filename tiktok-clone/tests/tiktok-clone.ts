import { TikTokClone } from '../target/types/tiktok_clone'
import BN from 'bn.js';

const anchor = require('@project-serum/anchor')
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token')
const _ = require('lodash')
const { web3 } = anchor
const { SystemProgram } = web3
const assert = require('assert')
const utf8 = anchor.utils.bytes.utf8
//const provider = anchor.Provider.env()
const provider = anchor.Provider.local()


const defaultAccounts = {
  tokenProgram: TOKEN_PROGRAM_ID,
  clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  systemProgram: SystemProgram.programId,
  // rent: anchor.web3.SYSVAR_RENT_PUBKEY,
}

// Configure the client to use the local cluster.
anchor.setProvider(provider)
const program = anchor.workspace.TikTokClone as Program<TikTokClone>
let creatorKey = provider.wallet.publicKey
let stateSigner
let videoSigner

describe('tiktok-clone', () => {
  it('Create State', async () => {
    ;[stateSigner] = await anchor.web3.PublicKey.findProgramAddress(
      [utf8.encode('state')],
      program.programId,
    )

    try {
      const stateInfo = await program.account.stateAccount.fetch(stateSigner)
    } catch {
      await program.rpc.createState({
        accounts: {
          state: stateSigner,
          authority: creatorKey,
          ...defaultAccounts,
        },
      })

      const stateInfo = await program.account.stateAccount.fetch(stateSigner)
      assert(
        stateInfo.authority.toString() === creatorKey.toString(),
        'State Creator is Invalid',
      )
    }
  })

  it("Create First Video", async () => {
    const stateInfo = await program.account.stateAccount.fetch(stateSigner);
    console.log(stateInfo.videoCount);

    if (stateInfo.videoCount > 0) {
      return;
    }

    [videoSigner] = await anchor.web3.PublicKey.findProgramAddress(
      [utf8.encode('video'), stateInfo.videoCount.toBuffer("be", 8)],
      program.programId
    );

    try{
      const videoInfo = await program.account.videoAccount.fetch(videoSigner);
      console.log(videoInfo);
    }
    catch{
      await program.rpc.createVideo("this is first video", "dummy_url","first", "https://first.com", {
        accounts: {
          state: stateSigner,
          video: videoSigner,
          authority: creatorKey,
          ...defaultAccounts
        },
      })

      const videoInfo = await program.account.videoAccount.fetch(videoSigner);
      console.log(videoInfo);
      assert(videoInfo.authority.toString() === creatorKey.toString(), "Video Creator is Invalid");
    }
  });

  it("Fetch All Videos",async () => {
    try{
      const videoInfo = await program.account.videoAccount.all();
      console.log(videoInfo);
    }
    catch (e) {
      console.log(e);
    }
  });

  it("Create Second Video", async () => {
    const stateInfo = await program.account.stateAccount.fetch(stateSigner);
    console.log(stateInfo.videoCount);

    if (stateInfo.videoCount > 1) {
      return;
    }

    [videoSigner] = await anchor.web3.PublicKey.findProgramAddress(
      [utf8.encode('video'), stateInfo.videoCount.toBuffer("be", 8)],
      program.programId
    );

    try{
      const videoInfo = await program.account.videoAccount.fetch(videoSigner);
      console.log(videoInfo);
    }
    catch{
      await program.rpc.createVideo("this is second video", "dummy_url", "second", "https://second.com", {
        accounts: {
          state: stateSigner,
          video: videoSigner,
          authority: creatorKey,
          ...defaultAccounts
        },
      })

      const videoInfo = await program.account.videoAccount.fetch(videoSigner);
      console.log(videoInfo);
      assert(videoInfo.authority.toString() === creatorKey.toString(), "Video Creator is Invalid");
    }
  });

  it("Create Comment to first", async () => {
    [videoSigner] = await anchor.web3.PublicKey.findProgramAddress(
      [utf8.encode('video'), new BN(0).toBuffer("be", 8)],
      program.programId
    );

    try{
      const videoInfo = await program.account.videoAccount.fetch(videoSigner);
      console.log(videoInfo);

      let [commentSigner] = await anchor.web3.PublicKey.findProgramAddress(
        [utf8.encode('comment'), videoInfo.index.toBuffer("be", 8), videoInfo.commentCount.toBuffer("be", 8)],
        program.programId
      );

      console.log(commentSigner);

      await program.rpc.createComment("this is great", "second", "https://second.com", {
        accounts: {
          video: videoSigner,
          comment: commentSigner,
          authority: creatorKey,
          ...defaultAccounts
        },
      });

      const commentInfo = await program.account.commentAccount.fetch(commentSigner);
      console.log(commentInfo);
      assert(videoInfo.authority.toString() === creatorKey.toString(), "Comment Creator is Invalid");
    }
    catch{
      assert(false, "Comment create failed")
    }
  });

  it("Fetch All Comments",async () => {
    try{
      const commentList = await program.account.commentAccount.all();
      console.log(commentList);
    }
    catch (e) {
      console.log(e);
    }
  });

  it("Videos can be liked correctly", async () => {
    const stateInfo = await program.account.stateAccount.fetch(stateSigner);
    console.log(stateInfo.videoCount);

    if (stateInfo.videoCount > 0) {
      return;
    }

    [videoSigner] = await anchor.web3.PublicKey.findProgramAddress(
      [utf8.encode('video'), stateInfo.videoCount.toBuffer("be", 8)],
      program.programId
    );

    try{
      const videoInfo = await program.account.videoAccount.fetch(videoSigner);
      console.log(videoInfo);
    }
    catch{
      await program.rpc.createVideo("this is first video", "dummy_url","first", "https://first.com", {
        accounts: {
          state: stateSigner,
          video: videoSigner,
          authority: creatorKey,
          ...defaultAccounts
        },
      })

      let videoInfo = await program.account.videoAccount.fetch(videoSigner);
      console.log(videoInfo);
      assert(videoInfo.authority.toString() === creatorKey.toString(), "Video Creator is Invalid");
      expect(videoInfo.likes).to.equal(0);
      await program.rpc.like_video(user.publicKey, {
        accounts: {
          video: videoSigner,
        },
        signers: []
      });

      videoInfo = await program.account.videoAccount.fetch(videoSigner);
      expect(videoInfo.likes).to.equal(1);
      expect(videoInfo.peopleWhoLiked[0].toString()).to.equal(user.publicKey.toString());

      await program.rpc.like_video(user.publicKey, {
        accounts: {
          video: videoSigner,
        },
        signers: []
      });
      try {
        await program.rpc.like_video(user.publicKey, {
          accounts: {
            video: videoSigner,
          },
          signers: []
        });
        assert.ok(false);
      } catch (error) {
        console.log('error ', error.toString());
        assert.equal(error.toString().toString(), 'User has already liked the tweet');
      }
      const secondUser = anchor.web3.Keypair.generate();
      await program.rpc.likeTweet(secondUser.publicKey, {
        accounts: {
          video: videoSigner.publicKey,
        },
        signers: []
      });
      const thirdUser = anchor.web3.Keypair.generate();
      await program.rpc.likeTweet(thirdUser.publicKey, {
        accounts: {
          video: videoSigner.publicKey,
        },
        signers: []
      });
      const fourth = anchor.web3.Keypair.generate();
      await program.rpc.likeTweet(fourth.publicKey, {
        accounts: {
          video: videoSigner.publicKey,
        },
        signers: []
      });
      const fifthUser = anchor.web3.Keypair.generate();
      await program.rpc.likeTweet(fifthUser.publicKey, {
        accounts: {
          video: videoSigner.publicKey,
        },
        signers: []
      });
      tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
      videoInfo = await program.account.videoAccount.fetch(videoSigner);
      expect(videoInfo.likes).to.equal(5);
      expect(videoInfo.peopleWhoLiked[4].toString()).to.equal(fifthUser.publicKey.toString());
      try {
        const sixthUser = anchor.web3.Keypair.generate();

        await program.rpc.like_video(sixthUser.publicKey, {
          accounts: {
            video: videoSigner,
          },
          signers: []
        });
        assert.ok(false);
      } catch (error) {
        console.log('error ', error.toString());
        assert.equal(error.toString().toString(), 'Cannot receive more than 5 likes');
      }

    }
  });


  it('should not allow writting an empty description', async () => {
    const stateInfo = await program.account.stateAccount.fetch(stateSigner);
    console.log(stateInfo.videoCount);

    if (stateInfo.videoCount > 0) {
      return;
    }

    [videoSigner] = await anchor.web3.PublicKey.findProgramAddress(
      [utf8.encode('video'), stateInfo.videoCount.toBuffer("be", 8)],
      program.programId
    );

    try{

      await program.rpc.createVideo("", "dummy_url","first", "https://first.com", {
        accounts: {
          state: stateSigner,
          video: videoSigner,
          authority: creatorKey,
          ...defaultAccounts
        },
      })
      assert.ok(false);
    } catch (error) {
      assert.equal(error.toString().toString(), 'Video cannot be created updated, missing data');
    }
  });

})
