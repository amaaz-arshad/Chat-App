import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, db, provider } from "../firebase";
import {
  setDoc,
  doc,
  Timestamp,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { Link, useHistory } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { FcGoogle } from "react-icons/fc";

const Register = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    error: null,
    loading: false,
  });

  const history = useHistory();

  const { name, email, password, error, loading } = data;

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setData({ ...data, error: null, loading: true });
    if (!name || !email || !password) {
      setData({ ...data, error: "All fields are required" });
    }
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(result.user);

      await updateProfile(auth.currentUser, {
        displayName: name,
      });
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name,
        email,
        photoURL: result.user.photoURL,
        createdAt: Timestamp.fromDate(new Date()),
        isOnline: true,
        token: "",
      });
      setData({
        name: "",
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
      console.log(result);
      if (
        result.user.metadata.creationTime ===
        result.user.metadata.lastSignInTime
      ) {
        console.log("set section executed");
        await setDoc(doc(db, "users", result.user.uid), {
          uid: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp(),
          isOnline: true,
          token: "",
        });
      } else {
        console.log("updated section executed");
        await updateDoc(doc(db, "users", result.user.uid), {
          isOnline: true,
        });
      }
      setData({
        ...data,
        error: null,
        loading: false,
      });
      history.replace("/");
    } catch (err) {
      setData({ ...data, error: err.message, loading: false });
    }
  };

  return (
    <section style={{ paddingTop: "1px" }}>
      <h3>Create An Account</h3>
      <form
        style={{ marginTop: "20px" }}
        className="form"
        onSubmit={handleSubmit}
      >
        <div className="input_container">
          <label htmlFor="name">Name</label>
          <input type="text" name="name" value={name} onChange={handleChange} />
        </div>
        <div className="input_container">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            name="email"
            value={email}
            onChange={handleChange}
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
                <span style={{ marginRight: "10px" }}>Creating</span>
                <CircularProgress color="inherit" size={15} />
              </>
            ) : (
              "Register"
            )}
          </button>
          <div style={{ marginTop: "5px" }}>
            <Link className="gotoLink" to="/login">
              Have an account already? Login!
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
          <span style={{ marginRight: "10px" }}>Sign Up with Google</span>
          <FcGoogle size={20} />
        </button>
      </div>
    </section>
  );
};

export default Register;
