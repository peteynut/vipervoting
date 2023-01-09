# vipervoting
Discord bot for betting on battles

A bot to imitate prediction votes/bets/payouts that you see on Twitch channels using channel points.

Currently implemented a simple voting system showing 2 Users (pulling discord profile pics and overlaying on a VS image)
/bet Timer, user1, user2 

![image](https://user-images.githubusercontent.com/121852408/211242527-968fe8d9-3443-4f64-bee6-5a7e21870a0e.png)

The code checks for @profiles, if a profile is tagged it will grab the profile pic then overlay it.

The timer is implemented by editing the embed reply on a timed loop, as far as I can tell this is the only way to have dynamic content in a discord reply. If you know of a better way I'd love to hear it because redrawing the whole thing seems very wasteful and janky.

The currency branch is working on implementing the actual betting/payout style. This will be using a Modal to prompt for bet amount, then the same embed redrawing for display.

I am thinking of a neat way for the authorised user who started the bet to decide who wins. More on this once I get there.
