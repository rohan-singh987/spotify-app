import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import spotifyAPI, { LOGIN_URL } from "../../../lib/spotify"


async function refreshAcessToken(token){
  try{
    spotifyAPI.setAccessToken(token.accessToken);
    spotifyAPI.setRefreshToken(token.refreshToken);
    
  } catch (error){
    console.error(error);

    return{
      ...token,
      error: "RefreshAccessTokenError"
    }
  }
}


export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      authorization = LOGIN_URL,
    }),
    // ...add more providers here
  ],

  secret: process.env.JWT_SECRET,

  pages: {
    signIn: '/login'
  },

  callbacks: {
    async jwt({ token, account, user }){

      // initial Sign-In
      if(account && user){
        return{
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          username: account.providerAccountId,
          accessTokenExpires: account.expires_at * 1000,
        };
      }

      if(Date.now() < token.accessTokenExpires)
      {
        console.log("Token is still valid");
      }

      console.log("Token Expired, Refereshing....");
      return await refreshAcessToken(token)
    }
  }
})