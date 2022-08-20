import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { updateDoc, doc } from "firebase/firestore";
import { AuthContext } from "../context/auth";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleSignout = async () => {
    document.cookie = "uid=; expires=" + new Date(2018, 0, 5).toUTCString();
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      isOnline: false,
    });
    await signOut(auth);
    navigate("/login");
  };

  // useEffect(() => {
  //   const timer = setTimeout(async () => {
  //     console.log(timer);
  //     // handleSignout();
  //     await updateDoc(doc(db, "users", auth.currentUser.uid), {
  //       isOnline: false,
  //     });
  //     await signOut(auth);
  //     navigate("/login");
  //   }, 3600000);
  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <nav>
      <h3>
        <Link to="/">Chat App</Link>
      </h3>
      <div>
        {user ? (
          <>
            <Link className="navlinks" to="/">
              Chats
            </Link>
            <Link className="navlinks" to="/profile">
              Profile
            </Link>
            <button className="btn" onClick={handleSignout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="navlinks" to="/login">
              Login
            </Link>
            <Link className="navlinks" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
