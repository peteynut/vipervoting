# vipervoting
Discord bot for betting on battles

A bot to imitate prediction votes/bets/payouts that you see on Twitch channels using channel points.

The only parity features missing at the moment is not listing biggest bet placed on each side, and a nice graphical bar showing which way the vote is heading. I tried to implement it with text but it was ugly.

![image](https://user-images.githubusercontent.com/121852408/211242527-968fe8d9-3443-4f64-bee6-5a7e21870a0e.png)

The code checks for @profiles, if a profile is tagged it will grab the profile pic then overlay it.

The timer is implemented by editing the embed reply on a timed loop, as far as I can tell this is the only way to have dynamic content in a discord reply. If you know of a better way I'd love to hear it because redrawing the whole thing seems very wasteful and janky.

Currency is now working, I have it set to pay out on an interval while user is in a VC but can easily change this.

The payout buttons are permissions based on an adminuser database which can be controlled by people with server admin rights.
