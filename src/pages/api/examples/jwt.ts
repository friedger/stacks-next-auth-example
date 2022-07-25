// This is an example of how to read a JSON Web Token from an API route
import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";
import { createJWT, decodeJWT, ES256KSigner, hexToBytes } from "did-jwt";
import { EthrDID } from "ethr-did";
import {
  createVerifiableCredentialJwt,
  Issuer,
  JwtCredentialPayload,
} from "did-jwt-vc";

const secret = process.env.NEXTAUTH_SECRET;
if (!secret) throw new Error("Secret missing");

// TODO use StacksDID
const issuer = new EthrDID({
  identifier: "0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198",
  privateKey:
    "d8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75",
}) as Issuer;

const userToDID = (_: string) => {
  // TODO decide on did method
  return "did:ethr:0x435df3eda57154cf8cf7926079881f2912f54db4";
};

const createVerifiableCredential = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const token = await getToken({ req, secret });
  const stxAddress = token?.sub;
  if (stxAddress) {
    const tweet = await fetchTweet(stxAddress);
    const twitterHandle = await verifiedTwitterHandle(tweet, stxAddress);

    const sub = userToDID(stxAddress);
    const vcPayload: JwtCredentialPayload = {
      sub,
      nbf: new Date().getTime(),
      vc: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential"],
        // TODO define credential schema
        credentialSubject: {
          accountHandle: {
            service: "https://twitter.com",
            user: twitterHandle,
          },
        },
      },
    };

    const signedVerifiedCredential = await createVerifiableCredentialJwt(
      vcPayload,
      issuer
    );

    res.send(JSON.stringify(signedVerifiedCredential, null, 2));
  }
};

async function fetchTweet(stxAddress: string) {
  return `<html><body>@twitterHandle<br/>My Stacks Address is ${stxAddress}</body></html>`;
}

async function verifiedTwitterHandle(tweet: string, stxAddress: string) {
  return "@twitterHandle";
}

export default createVerifiableCredential;
