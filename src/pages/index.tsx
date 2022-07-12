import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useConnect, UserData } from "@stacks/connect-react";
import { getCsrfToken, signIn, signOut } from "next-auth/react";
import { appDetails, userSession } from "./_app";
import { SignInWithStacksMessage } from "../utils/sign-in-with-stacks/signInWithStacksMessage";

const Home: NextPage = () => {
  const { sign, authenticate, userSession } = useConnect();
  const [stacksUser, setStacksUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (userSession?.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setStacksUser(userData);
      });
    } else if (userSession?.isUserSignedIn()) {
      setStacksUser(userSession.loadUserData());
    }
  }, [userSession]);

  const handleLogin = () => {
    authenticate({
      appDetails,
      onFinish: ({ userSession }) => setStacksUser(userSession.loadUserData()),
    });
  };

  const handleSign = async () => {
    if (!stacksUser) return;

    const callbackUrl = "/protected";
    const stacksMessage = new SignInWithStacksMessage({
      domain: `${window.location.protocol}//${window.location.host}`,
      address: stacksUser.profile.stxAddress.testnet,
      statement: "Sign in with Stacks to the app.",
      uri: window.location.origin,
      version: "1",
      chainId: 1,
      nonce: (await getCsrfToken()) as string,
    });

    const message = stacksMessage.prepareMessage();

    console.log({ sign, message });
    sign({
      message,
      onFinish: ({ signature }) => {
        signIn("credentials", {
          message: message,
          redirect: false,
          signature,
          callbackUrl,
        });
      },
    });
  };

  const handleLogOut = async () => {
    userSession?.signUserOut("/");
  };

  return (
    <div>
      {stacksUser ? null : (
        <button onClick={handleLogin}>Sign-In with Stacks</button>
      )}
      {stacksUser ? (
        <>
          {stacksUser.profile.stxAddress.mainnet}
          <button onClick={handleSign}>Sign message</button>
          <button onClick={handleLogOut}>Log out</button>
        </>
      ) : null}
    </div>
  );
};

export default Home;
