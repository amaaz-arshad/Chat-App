import React, { useEffect, useState } from "react";
import { db, auth, storage, actionCodeSettings } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
  orderBy,
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import User from "../components/User";
import MessageForm from "../components/MessageForm";
import Message from "../components/Message";
import { sendSignInLinkToEmail } from "firebase/auth";
import { CircularProgress } from "@mui/material";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState("");
  const [text, setText] = useState("");
  const [img, setImg] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [email, setEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const user1 = auth.currentUser.uid;

  useEffect(async () => {
    const usersRef = collection(db, "users");
    const docData = await getDoc(doc(db, "users", auth.currentUser.uid));
    console.log(docData.data());
    let addedUsers = docData.data().addedUsers;
    console.log("added users(from home page):", addedUsers);
    if (addedUsers.length !== 0) {
      const q = query(usersRef, where("email", "in", addedUsers));
      // const q = query(usersRef, where("uid", "not-in", [user1]));
      // execute query
      const unsub = onSnapshot(q, (querySnapshot) => {
        let users = [];
        querySnapshot.forEach((doc) => {
          users.push(doc.data());
        });
        console.log("users:", users);
        setUsers(users);
      });
      return () => unsub();
    } else {
      setUsers([]);
    }
  }, []);

  const selectUser = async (user) => {
    setChat(user);

    const user2 = user.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    const msgsRef = collection(db, "messages", id, "chat");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    onSnapshot(q, (querySnapshot) => {
      let msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push(doc.data());
      });
      setMsgs(msgs);
    });

    // get last message b/w logged in user and selected user
    const docSnap = await getDoc(doc(db, "lastMsg", id));
    // if last message exists and message is from selected user
    if (docSnap.data() && docSnap.data().from !== user1) {
      // update last message doc, set unread to false
      await updateDoc(doc(db, "lastMsg", id), { unread: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user2 = chat.uid;

    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    let url;
    if (img) {
      const imgRef = ref(
        storage,
        `images/${new Date().getTime()} - ${img.name}`
      );
      const snap = await uploadBytes(imgRef, img);
      const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
      url = dlUrl;
    }

    setText("");
    setImg("");

    await addDoc(collection(db, "messages", id, "chat"), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
    });

    await setDoc(doc(db, "lastMsg", id), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
      unread: true,
    });
  };

  // console.log("chat:", chat);

  const sendInvite = async (e) => {
    setInviteLoading(true);
    e.preventDefault();
    try {
      console.log(auth);
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      const docData = await getDoc(doc(db, "users", auth.currentUser.uid));
      console.log(docData.data());
      let addedUsers = docData.data().addedUsers;
      addedUsers.push(email);
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        addedUsers,
      });
      setInviteLoading(false);
      // The link was successfully sent. Inform the user.
      // Save the email locally so you don't need to ask the user for it again
      // if they open the link on the same device.
      window.localStorage.setItem("emailForSignIn", email);
      window.localStorage.setItem("invitationEmail", auth.currentUser.email);
      // ...
      console.log("invitation sent to", email);
      alert("Chat invitation sent successfully");
      setEmail("");
    } catch (error) {
      console.log(error.code, error.message);
      setInviteLoading(false);
      alert(error.message);
    }
  };

  return (
    <div className="home_container">
      <div className="users_container">
        <div className="send-invite">
          <form onSubmit={sendInvite}>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {inviteLoading ? (
              <button type="submit" disabled>
                <span style={{ marginRight: "10px" }}>Sending invite</span>
                <CircularProgress color="inherit" size={13} />
              </button>
            ) : (
              <button type="submit">Send Chat Invite</button>
            )}
          </form>
        </div>

        <h3 className="available-chats">Available Chats</h3>

        {users.map((user) => (
          <User
            key={user.uid}
            user={user}
            selectUser={selectUser}
            user1={user1}
            chat={chat}
          />
        ))}
      </div>
      <div className="messages_container">
        {chat ? (
          <>
            <div className="messages_user">
              <h3>{chat.name}</h3>
            </div>
            <div className="messages">
              {msgs.length
                ? msgs.map((msg, i) => (
                    <Message key={i} msg={msg} user1={user1} />
                  ))
                : null}
            </div>
            <MessageForm
              handleSubmit={handleSubmit}
              text={text}
              setText={setText}
              setImg={setImg}
            />
          </>
        ) : (
          <h3 className="no_conv">Select a user to start conversation</h3>
        )}
      </div>
    </div>
  );
};

export default Home;
