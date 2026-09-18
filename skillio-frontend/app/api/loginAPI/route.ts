import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import jwt from "jsonwebtoken";

export async function POST(req: { text: () => any; json: () => PromiseLike<{ email: any; password: any; }> | { email: any; password: any; }; }) {
  try {
    const { email, password } = await req.json();
    console.log("test : " + email +"\n"+ password)
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const user = await db.collection("Users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
    //create the token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET!, 
      { expiresIn: "1d" }
    );

    // ---------- SET COOKIE ----------
    const response = NextResponse.json(
      { message: "Login successful", token },
      { status: 200 }
    );
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 // 1 day
    });

    // Successful login
    // return NextResponse.json(
    //   { message: "Login successful" },
    //   { status: 200 }
    // );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }
}
