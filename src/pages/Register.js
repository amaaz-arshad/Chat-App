import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db, provider } from "../firebase";
import { setDoc, doc, Timestamp, serverTimestamp } from "firebase/firestore";
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
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name,
        email,
        photoURL: result.user.photoURL,
        createdAt: Timestamp.fromDate(new Date()),
        isOnline: true,
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
          <span style={{ marginRight: "10px" }}>Sign Up with google</span>
          <FcGoogle size={20} />
        </button>
      </div>
    </section>
  );
};

export default Register;
