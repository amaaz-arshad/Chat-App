import React from "react";
import Attachment from "./svg/Attachment";
import { CgAttachment } from "react-icons/cg";

import ImageIcon from "@mui/icons-material/Image";

const MessageForm = ({ handleSubmit, text, setText, setImg }) => {
  return (
    <form className="message_form" onSubmit={handleSubmit}>
      <label htmlFor="img">
        <CgAttachment
          style={{
            color: "silver",
            fontSize: "25px",
            position: "relative",
            bottom: "3px",
            cursor: "pointer",
          }}
        />
        {/* <ImageIcon
          sx={{
            color: "gray",
            fontSize: "30px",
            position: "relative",
            bottom: "5px",
          }}
        /> */}
      </label>
      <input
        onChange={(e) => setImg(e.target.files[0])}
        type="file"
        id="img"
        accept="image/*"
        style={{ display: "none" }}
      />
      <div>
        <input
          type="text"
          placeholder="Enter message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div>
        <button className="btn">Send</button>
      </div>
    </form>
  );
};

export default MessageForm;
