import React, { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth, db, provider } from "../firebase";
import { updateDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link, useHistory } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
    error: null,
    loading: false,
  });

  const history = useHistory();

  const { email, password, error, loading } = data;

  useEffect(() => {
    // Confirm the link is a sign-in with email link.
    // const auth = getAuth();
    const loginWithLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        // Additional state parameters can also be passed via URL.
        // This can be used to continue the user's intended action before triggering
        // the sign-in operation.
        // Get the email if available. This should be available if the user completes
        // the flow on the same device where they started it.
        setData({ ...data, error: null, loading: true });
        try {
          let email = window.localStorage.getItem("emailForSignIn");
          if (!email) {
            // User opened the link on a different device. To prevent session fixation
            // attacks, ask the user to provide the associated email again. For example:
            email = window.prompt("Please provide your email for confirmation");
          }
          let name = window.prompt("Enter your name");
          // The client SDK will parse the code from the link for you.

          const result = await signInWithEmailLink(
            auth,
            email,
            window.location.href
          );

          // Clear email from storage.
          window.localStorage.removeItem("emailForSignIn");
          // You can access the new user via result.user
          // Additional user info profile not available via:
          // result.additionalUserInfo.profile == null
          // You can check if the user is new or existing:
          // result.additionalUserInfo.isNewUser
          console.log(result.user);
          console.log(result);

          await setDoc(doc(db, "users", result.user.uid), {
            uid: result.user.uid,
            name,
            email: result.user.email,
            photoURL: result.user.photoURL,
            createdAt: serverTimestamp(),
            isOnline: true,
          });
          setData({
            email: "",
            password: "",
            error: null,
            loading: false,
          });
          history.replace("/");
        } catch (err) {
          console.log(err.message);
          setData({ ...data, error: err.message, loading: false });
        }
      }
    };
    loginWithLink();
  }, []);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setData({ ...data, error: null, loading: true });
    if (!email || !password) {
      setData({ ...data, error: "All fields are required" });
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      await updateDoc(doc(db, "users", result.user.uid), {
        isOnline: true,
      });
      setData({
        email: "",
        password: "",
        error: null,
        loading: false,
      });
      history.replace("/");
    } catch (err) {
      setData({ ...data, error: err.message, loading: false });
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      //console.log(result);
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        createdAt: serverTimestamp(),
        isOnline: true,
      });
      setData({
        email: "",
        password: "",
        error: null,
        loading: false,
      });
      history.replace("/");
    } catch (err) {
      setData({ ...data, error: err.message, loading: false });
    }
  };

  return (
    <div style={{ paddingLeft: "20px", paddingRight: "20px" }}>
      <section>
        <h3>Log into your Account</h3>
        <form className="form" onSubmit={handleSubmit}>
          <div className="input_container">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              name="email"
              value={email}
              onChange={handleChange}
              // placeholder="Enter email..."
            />
          </div>
          <div className="input_container">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
            />
          </div>
          {error ? <p className="error">{error}</p> : null}
          <div className="btn_container">
            <button className="btn" disabled={loading}>
              {loading ? (
                <>
                  <span style={{ marginRight: "10px" }}>Logging in</span>
                  <CircularProgress color="inherit" size={15} />
                </>
              ) : (
                "Login"
              )}
            </button>
            <div style={{ marginTop: "5px" }}>
              <Link className="gotoLink" to="/register">
                No account yet? Register now!
              </Link>
            </div>
          </div>
        </form>
        <div
          className="btn_container"
          style={{
            paddingLeft: "20px",
            paddingRight: "20px",
            marginTop: "25px",
            marginBottom: "15px",
          }}
        >
          <button className="btn" onClick={signInWithGoogle} disabled={loading}>
            <span style={{ marginRight: "10px" }}>Sign In with Google</span>
            <FcGoogle size={20} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Login;
