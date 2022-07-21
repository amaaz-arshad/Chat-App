import React, { useRef, useEffect } from "react";
import Moment from "react-moment";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AccordionBody from "react-bootstrap/esm/AccordionBody";

const Message = ({ msg, user1 }) => {
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msg]);
  return (
    <div
      className={`message_wrapper ${msg.from === user1 ? "own" : ""}`}
      ref={scrollRef}
    >
      <p className={msg.from === user1 ? "me" : "friend"}>
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
              {/* Click here to view attachment */}
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
        {msg.text ? (
          <span>
            {msg.text} <br />
          </span>
        ) : null}

        <small>
          <Moment fromNow>{msg.createdAt.toDate()}</Moment>
        </small>
      </p>
    </div>
  );
};

export default Message;
