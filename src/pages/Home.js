import React, { useEffect, useState } from "react";
import { db, auth, storage, actionCodeSettings, messaging } from "../firebase";
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
import {
  ref,
  getDownloadURL,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import User from "../components/User";
import MessageForm from "../components/MessageForm";
import Message from "../components/Message";
import { sendSignInLinkToEmail, signOut } from "firebase/auth";
import { CircularProgress } from "@mui/material";
// import swDev from "../swDev";
import { getToken } from "firebase/messaging";
import { getMessaging, onMessage } from "firebase/messaging";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState("");
  const [text, setText] = useState("");
  const [img, setImg] = useState("");
  // const [fileName, setfileName] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [email, setEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [token, setToken] = useState("");
  const [progress, setProgress] = useState(0);
  const [isMsgSending, setIsMsgSending] = useState(false);
  const [isfileAttached, setIsfileAttached] = useState(false);
  const [tabHasFocus, setTabHasFocus] = useState(true);
  const navigate = useNavigate();

  const user1 = auth.currentUser.uid;
  let fileName = "";
  let timer;

  useEffect(() => {
    const handleFocus = () => {
      console.log("Tab has focus");
      setTabHasFocus(true);
      clearTimeout(timer);
    };

    const handleBlur = () => {
      console.log("Tab lost focus");
      setTabHasFocus(false);
      timer = setTimeout(async () => {
        // handleSignout();
        console.log("Session expired. Logging out...");
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          isOnline: false,
        });
        await signOut(auth);
        navigate("/login");
      }, 3600000);
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);
      // ...
    });
    function requestPermission() {
      console.log("Requesting permission...");
      Notification.requestPermission().then((permission) => {
        console.log(permission);
        if (permission === "granted") {
          getToken(messaging, {
            vapidKey:
              "BLZNfKDSTLQ32jw2Ohf9PcN2tbew1I5Uv9SWX9pUIKD67PFA51yXsWdeny5kHx5twO0JoVRy1GNVsHgFt0uUnQU",
          })
            .then((currentToken) => {
              if (currentToken) {
                console.log("token:", currentToken);
                updateDoc(doc(db, "users", auth.currentUser.uid), {
                  token: currentToken,
                });
                //setToken(currentToken);
                // Send the token to your server and update the UI if necessary
                // ...
              } else {
                // Show permission request UI
                console.log(
                  "No registration token available. Request permission to generate one."
                );
                // ...
              }
            })
            .catch((err) => {
              console.log("An error occurred while retrieving token. ", err);
              // ...
            });
        }
      });
    }
    requestPermission();
  }, []);

  useEffect(() => {
    // swDev();
    const usersRef = collection(db, "users");
    // create query object
    const q = query(usersRef, where("uid", "not-in", [user1]));
    // execute query
    const unsub = onSnapshot(q, (querySnapshot) => {
      let users = [];
      querySnapshot.forEach((doc) => {
        console.log("doc data:", doc.data());
        users.push(doc.data());
      });
      console.log("users:", users);
      setUsers(users);
    });
    return () => unsub();
  }, []);

  const selectUser = async (user) => {
    console.log("selected user:", user);
    setChat(user);

    const user2 = user.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    const msgsRef = collection(db, "messages", id, "chat");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    onSnapshot(q, (querySnapshot) => {
      let msgs = [];
      querySnapshot.forEach((doc) => {
        // console.log("msgs:", { ...doc.data(), id: doc.id });
        msgs.push({ ...doc.data(), id: doc.id });
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
    // console.log("chat:", chat);

    setIsMsgSending(true);
    const user2 = chat.uid;

    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    let url;
    try {
      if (img) {
        console.log("file in home:", img);
        fileName = img.name;
        const imgRef = ref(
          storage,
          `images/${new Date().getTime()} - ${img.name}`
        );
        const snap = await uploadBytesResumable(imgRef, img);
        // snap.on("state_changed", (snapshot) => {
        //   const prog = Math.round(
        //     (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        //   );
        //   setProgress(prog);
        // });
        const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
        url = dlUrl;
      }

      setText("");
      setImg("");
      setIsMsgSending(false);
      setIsfileAttached(false);
    } catch (error) {
      console.log(error);
      setIsMsgSending(false);
    }

    if (text || img) {
      await addDoc(collection(db, "messages", id, "chat"), {
        text,
        from: user1,
        to: user2,
        createdAt: Timestamp.fromDate(new Date()),
        media: url || "",
        fileName,
      });

      await setDoc(doc(db, "lastMsg", id), {
        text,
        from: user1,
        to: user2,
        createdAt: Timestamp.fromDate(new Date()),
        media: url || "",
        fileName,
        unread: true,
      });

      let body = {
        to: chat.token,
        notification: {
          title: `Message from ${auth.currentUser.displayName}`,
          body: text,
          icon: url,
        },
      };
      console.log(body);

      let options = {
        method: "POST",
        headers: new Headers({
          Authorization:
            "key=AAAAG-WmdaM:APA91bFs8ZvZg9vUQTZgC5N601T6PbwL4s0hfxdTWViQ0Wq6sdB0LV-UTuEYjFbPzL3AmP1Zxvqchq2NtfQgKcdzzFzD6vCuwoRi_aZpn5mjTbWpnOb69zhDg6zuxlxK_c1K_bgb3CPN",
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(body),
      };

      fetch("https://fcm.googleapis.com/fcm/send", options)
        .then((res) => {
          console.log("SENT");
          console.log(res);
        })
        .catch((err) => {
          console.log("Error:", err);
        });
    }
  };

  return (
    <div className="home_container">
      <div className="users_container">
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
            {isfileAttached && (
              <div className="file-attach-msg">( file attached )</div>
            )}
            <MessageForm
              handleSubmit={handleSubmit}
              text={text}
              setText={setText}
              img={img}
              setImg={setImg}
              isMsgSending={isMsgSending}
              setIsfileAttached={setIsfileAttached}
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
