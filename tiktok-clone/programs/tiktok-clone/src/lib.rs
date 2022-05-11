/// Include libraries for program
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token};
use std::mem::size_of;
use anchor_lang::solana_program::log::{
    sol_log_compute_units
};
// Declare program ID
declare_id!("Az4edEtU6JtghfueC4hS7Fo5fG3evPY5VUt6YbNHmhaN");

// Video and comment text length
const TEXT_LENGTH: usize = 1024;
// Username length
const USER_NAME_LENGTH: usize = 100;
// User profile image url length
const USER_URL_LENGTH: usize = 255;
const VIDEO_URL_LENGTH: usize = 255;

const NUMBER_OF_ALLOWED_LIKES_SPACE: usize = 5;
const NUMBER_OF_ALLOWED_LIKES: u8 = 5;
/// TikTok Clone program
#[program]
pub mod tiktok_clone {
    use super::*;

    /// Create state to save the video counts
    /// There is only one state in the program
    /// This account should be initialized before video
    pub fn create_state(
        ctx: Context<CreateState>,
    ) -> ProgramResult {
        // Get state from context
        let state = &mut ctx.accounts.state;
        // Save authority to state
        state.authority = ctx.accounts.authority.key();
        // Set video count as 0 when initializing
        state.video_count = 0;
        Ok(())
    }

    /// Create user
    /// @param name:        user name
    /// @param profile_url: user profile url
    pub fn create_user(
        ctx: Context<CreateUser>,
        name: String,
        profile_url: String
    ) -> ProgramResult {
        // Get State

       if name.trim().is_empty() || profile_url.trim().is_empty() {
           return Err(Errors::CannotCreateUser.into());
       }
        // Get video
        let user = &mut ctx.accounts.user;
        // Set authority
        user.user_wallet_address = ctx.accounts.authority.key();
        // Set text
        user.user_name = name;
        user.user_profile_image_url = profile_url;

        msg!("User Added!");  //logging
        sol_log_compute_units(); //Logs how many compute units are left, important for budget
        Ok(())
    }

    /// Create video
    /// @param text:        text of video
    /// @param creator_name: name of video creator
    /// @param creator_url:  url of video creator avatar
    pub fn create_video(
        ctx: Context<CreateVideo>,
        description: String,
        video_url: String,
        creator_name: String,
        creator_url: String,
    ) -> ProgramResult {
        // Get State
       msg!(&description);  //logging

       if description.trim().is_empty() || video_url.trim().is_empty() {
           return Err(Errors::CannotCreateVideo.into());
       }
        let state = &mut ctx.accounts.state;

        // Get video
        let video = &mut ctx.accounts.video;
        // Set authority
        video.authority = ctx.accounts.authority.key();
        // Set text
        video.description = description;
        video.video_url = video_url;

        // Set creator name
        video.creator_name = creator_name;
        // Set creator avatar url
        video.creator_url = creator_url;
        // Set comment count as 0
        video.comment_count = 0;
        // Set video index as state's video count
        video.index = state.video_count;
        // Set video time
        video.creator_time = ctx.accounts.clock.unix_timestamp;

        video.likes = 0;

        video.remove = 0;

        // Increase state's video count by 1
        state.video_count += 1;
        msg!("Video Added!");  //logging
        sol_log_compute_units(); //Logs how many compute units are left, important for budget
        Ok(())
    }


    /// Create comment for video
    /// @param text:            text of comment
    /// @param commenter_name:  name of comment creator
    /// @param commenter_url:   url of comment creator avatar
    pub fn create_comment(
        ctx: Context<CreateComment>,
        text: String,
        commenter_name: String,
        commenter_url: String,
    ) -> ProgramResult {

        // Get video
        let video = &mut ctx.accounts.video;
        if video.remove <= -500 {
            return Err(Errors::UserCensoredVideo.into());
        }
        // Get comment
        let comment = &mut ctx.accounts.comment;
        // Set authority to comment
        comment.authority = ctx.accounts.authority.key();
        // Set comment text
        comment.text = text;
        // Set commenter name
        comment.commenter_name = commenter_name;
        // Set commenter url
        comment.commenter_url = commenter_url;
        // Set comment index to video's comment count
        comment.index = video.comment_count;
        // Set video time
        comment.video_time = ctx.accounts.clock.unix_timestamp;

        // Increase video's comment count by 1
        video.comment_count += 1;

        Ok(())
    }

    pub fn approve(
        ctx: Context<CreateComment>,
    ) -> ProgramResult {
        // Get video
        let video = &mut ctx.accounts.video;

        // Increase video's comment count by 1
        video.remove += 1;

        Ok(())
    }

    pub fn disapprove(
        ctx: Context<CreateComment>,

    ) -> ProgramResult {
        // Get video
        let video = &mut ctx.accounts.video;

        // Increase video's comment count by 1
        video.remove -= 1;

        Ok(())
    }

    pub fn like_video(ctx: Context<LikeVideo>) -> ProgramResult {
        let video = &mut ctx.accounts.video;

        if video.likes == NUMBER_OF_ALLOWED_LIKES {
            return Err(Errors::ReachedMaxLikes.into());
        }
        if video.remove == -500 {
            return Err(Errors::UserCensoredVideo.into());
        }

        // Iterating accounts is safer then indexing
        let mut iter = video.people_who_liked.iter();
        let user_liking_video = ctx.accounts.authority.key();
        if iter.any(|&v| v == user_liking_video) {
            return Err(Errors::UserLikedVideo.into());
        }

        video.likes += 1;
        video.people_who_liked.push(user_liking_video);

        Ok(())
    }

}

/// Contexts
/// CreateState context
#[derive(Accounts)]
pub struct CreateState<'info> {
    // Authenticating state account
    #[account(
        init,
        seeds = [b"state".as_ref()],
        bump,
        payer = authority,
        space = size_of::<StateAccount>() + 8
    )]
    pub state: Account<'info, StateAccount>,

    // Authority (this is signer who paid transaction fee)
    #[account(mut)]
    pub authority: Signer<'info>,

    /// System program
    /// CHECK: Simple test account for tiktok
    pub system_program: UncheckedAccount<'info>,

    // Token program
    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: Program<'info, Token>,
}

/// CreateUser context
#[derive(Accounts)]
pub struct CreateUser<'info> {
    // Authenticate user account
    #[account(
        init,
        // User account use string "user" and index of user as seeds
        seeds = [b"user".as_ref(), authority.key().as_ref()],
        bump,
        payer = authority,
        space = size_of::<UserAccount>() + USER_NAME_LENGTH + VIDEO_URL_LENGTH + 8
    )]
    pub user: Account<'info, UserAccount>,

    // Authority (this is signer who paid transaction fee)
    #[account(mut)]
    pub authority: Signer<'info>,

    /// System program
    /// CHECK: Simple test account for tiktok
    pub system_program: UncheckedAccount<'info>,

    // Token program
    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: Program<'info, Token>,

    // Clock to save time
    pub clock: Sysvar<'info, Clock>,
}

/// CreateVideo context
#[derive(Accounts)]
pub struct CreateVideo<'info> {
    // Authenticate state account
    #[account(mut, seeds = [b"state".as_ref()], bump)]
    pub state: Account<'info, StateAccount>,

    // Authenticate video account
    #[account(
        init,
        // Video account use string "video" and index of video as seeds
        seeds = [b"video".as_ref(), state.video_count.to_be_bytes().as_ref()],
        bump,
        payer = authority,
        space = size_of::<VideoAccount>() + TEXT_LENGTH + USER_NAME_LENGTH + USER_URL_LENGTH+VIDEO_URL_LENGTH+8+32*NUMBER_OF_ALLOWED_LIKES_SPACE // 32 bits in a pubkey and we have 5
    )]
    pub video: Account<'info, VideoAccount>,

    // Authority (this is signer who paid transaction fee)
    #[account(mut)]
    pub authority: Signer<'info>,

    /// System program
    /// CHECK: Simple test account for tiktok
    pub system_program: UncheckedAccount<'info>,

    // Token program
    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: Program<'info, Token>,

    // Clock to save time
    pub clock: Sysvar<'info, Clock>,
}

/// CreateComment context
#[derive(Accounts)]
pub struct CreateComment<'info> {
    // Authenticate video account
    #[account(mut, seeds = [b"video".as_ref(), video.index.to_be_bytes().as_ref()], bump)]
    pub video: Account<'info, VideoAccount>,

    // Authenticate comment account
    #[account(
        init,
        // Video account use string "comment", index of video and index of comment per video as seeds
        seeds = [b"comment".as_ref(), video.index.to_be_bytes().as_ref(), video.comment_count.to_be_bytes().as_ref()],
        bump,
        payer = authority,
        space = size_of::<CommentAccount>() + TEXT_LENGTH + USER_NAME_LENGTH + USER_URL_LENGTH+VIDEO_URL_LENGTH
    )]
    pub comment: Account<'info, CommentAccount>,

    // Authority (this is signer who paid transaction fee)
    #[account(mut)]
    pub authority: Signer<'info>,

    /// System program
    /// CHECK: Simple test account for tiktok
    pub system_program: Program<'info, System>,

    // Token program
    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: Program<'info, Token>,

    // Clock to save time
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct LikeVideo<'info> {
    #[account(mut)]
    pub video: Account<'info, VideoAccount>,

    // Authority (this is signer who paid transaction fee)
    #[account(mut)]
    pub authority: Signer<'info>,

    /// System program
    /// CHECK: Simple test account for tiktok
    pub system_program: UncheckedAccount<'info>,

    // Token program
    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: Program<'info, Token>,

    // Clock to save time
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct Approve<'info> {
    #[account(mut)]
    pub video: Account<'info, VideoAccount>
}

#[derive(Accounts)]
pub struct DisApprove<'info> {
    #[account(mut)]
    pub video: Account<'info, VideoAccount>
}


// State Account Structure
#[account]
pub struct StateAccount {
    // Signer address
    pub authority: Pubkey,

    // Video count
    pub video_count: u64,
}

// State Account Structure
#[account]
pub struct UserAccount {
    // user name
    pub user_name: String,

    // user wallet address
    pub user_wallet_address: Pubkey,

    // user profile image url
    pub user_profile_image_url: String,
}

// Video Account Structure
#[account]
pub struct VideoAccount {
    // Signer address
    pub authority: Pubkey,

    // description text
    pub description: String,

    // video url
    pub video_url: String,

    // Video creator name
    pub creator_name: String,

    // Video creator url
    pub creator_url: String,

    // Comment counts of videos
    pub comment_count: u64,

    // Video index
    pub index: u64,

    // Video time
    pub creator_time: i64,

    // likes: vector of people who liked it,
    pub people_who_liked: Vec<Pubkey>,

    // number of likes
    pub likes: u8,

    pub remove: i64,
}

// Comment Account Structure
#[account]
pub struct CommentAccount {
    // Signer address
    pub authority: Pubkey,

    // Comment text
    pub text: String,

    // commenter_name
    pub commenter_name: String,

    // commenter_url
    pub commenter_url: String,

    // Comment index
    pub index: u64,

    // Video time
    pub video_time: i64,
}


#[error]
pub enum Errors {
    #[msg("User cannot be created, missing data")]
    CannotCreateUser,

    #[msg("Video cannot be created, missing data")]
    CannotCreateVideo,

    #[msg("Cannot receive more than 5 likes")]
    ReachedMaxLikes,


    #[msg("User has already liked the tweet")]
    UserLikedVideo,

    #[msg("Video with potentially bad content")]
    UserCensoredVideo,
}
