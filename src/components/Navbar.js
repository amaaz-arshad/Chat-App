import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { updateDoc, doc } from "firebase/firestore";
import { AuthContext } from "../context/auth";
import { useHistory } from "react-router-dom";

const Navbar = () => {
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const handleSignout = async () => {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      isOnline: false,
    });
    await signOut(auth);
    history.replace("/login");
  };
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
            <Link className="navlinks" to="/register">
              Register
            </Link>
            <Link className="navlinks" to="/login">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
