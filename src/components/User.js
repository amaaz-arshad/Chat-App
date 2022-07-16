import React, { useEffect, useState } from "react";
import Img from "../image1.webp";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

const User = ({ user1, user, selectUser, chat }) => {
  console.log("chat:", chat);
  console.log("user:", user);
  console.log("user1:", user1);
  console.log("selectUser:", selectUser);

  const user2 = user?.uid;
  const [data, setData] = useState("");
  useEffect(() => {
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
    let unsub = onSnapshot(doc(db, "lastMsg", id), (doc) => {
      setData(doc.data());
    });

    return () => unsub();
  }, []);

  return (
    <>
      <div
        className={`user_wrapper ${chat.uid === user.uid && "selected_user"}`}
        onClick={() => selectUser(user)}
      >
        <div className="user_info">
          <div className="user_detail">
            <img
              src={user.avatar || user.photoURL || Img}
              alt="avatar"
              className="avatar"
            />

            <h4>{user.name}</h4>
            {data?.from !== user1 && data?.unread && (
              <small className="unread">New</small>
            )}
          </div>
          <div
            className={`user_status ${user.isOnline ? "online" : "offline"}`}
          ></div>
        </div>
        {data && (
          <p className="truncate">
            <strong>{data.from === user1 ? " Me:" : null}</strong>
            {data.text}
          </p>
        )}
      </div>
      <div
        onClick={() => selectUser(user)}
        className={`sm_container ${chat.uid === user.uid && "selected_user"}`}
      >
        <img
          src={user.avatar || user.photoURL || Img}
          alt="avatar"
          className="avatar sm_screen"
        />
      </div>
    </>
  );
};

export default User;
