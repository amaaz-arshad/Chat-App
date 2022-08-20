import React, { useRef, useEffect, useState } from "react";
import Moment from "react-moment";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AccordionBody from "react-bootstrap/esm/AccordionBody";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const Message = ({ msg, user1 }) => {
  const scrollRef = useRef();
  const [displayToggle, setDisplayToggle] = useState(false);

  async function deleteMsg(msgId) {
    console.log("delete btn was clicked");
    console.log(msg);
    const id =
      msg.from > msg.to ? `${msg.from + msg.to}` : `${msg.to + msg.from}`;
    await deleteDoc(doc(db, "messages", id, "chat", msgId));
    // const list = [...dataList];
    //   list.splice(index, 1);
    //   setDataList(list);
    // const descDoc = doc(db, "descriptions", id);
    // await deleteDoc(descDoc);
    setDisplayToggle(!displayToggle);
  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msg]);
  return (
    <div
      className={`message_wrapper ${msg.from === user1 ? "own" : ""}`}
      ref={scrollRef}
    >
      <p className={msg.from === user1 ? "me" : "friend"}>
        <span className="menu">
          <MoreHorizIcon
            style={{
              cursor: "pointer",
            }}
            onClick={() => {
              setDisplayToggle(!displayToggle);
            }}
          />
        </span>
        {/* submenu */}
        <div
          className="submenu"
          style={{ display: displayToggle ? "block" : "none" }}
          onClick={() => {
            deleteMsg(msg.id);
          }}
        >
          Delete
        </div>
        {/* <img src={msg.media} alt={msg.text} />  */}
        {msg.media ? (
          <a target="_blank" className="attachment-link" href={msg.media}>
            <div
              className={msg.from === user1 ? "msg-me" : "msg-friend"}
              style={{
                padding: "0 10px 20px 5px",
                borderRadius: "5px",
                marginBottom: "2px",
              }}
            >
              {/* <div> */}
              <InsertDriveFileIcon
                style={{
                  cursor: "pointer",
                  fontSize: "35px",
                  position: "relative",
                  top: "12px",
                }}
              />
              <span style={{ fontSize: "13px" }}> {msg.fileName} </span>
              {/* </div> */}
            </div>
          </a>
        ) : null}
        {msg.text ? <span>{msg.text}</span> : null}

        <div style={{ textAlign: "right" }}>
          <small>
            <Moment fromNow>{msg.createdAt.toDate()}</Moment>
          </small>
        </div>
      </p>
    </div>
  );
};

export default Message;
