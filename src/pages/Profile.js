import React, { useState, useEffect } from "react";
import Camera from "../components/svg/Camera";
import Img from "../image1.webp";
import { storage, db, auth } from "../firebase";
import {
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import Delete from "../components/svg/Delete";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
  const [img, setImg] = useState("");
  const [user, setUser] = useState();
  const navigate = useNavigate("");
  const [tabHasFocus, setTabHasFocus] = useState(true);
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
    getDoc(doc(db, "users", auth.currentUser.uid)).then((docSnap) => {
      if (docSnap.exists) {
        setUser(docSnap.data());
      }
    });

    if (img) {
      const uploadImg = async () => {
        const id = toast.loading("Uploading photo ...", {
          position: "top-center",
          theme: "dark",
          draggable: true,
        });
        const imgRef = ref(
          storage,
          `avatar/${new Date().getTime()} - ${img.name}`
        );
        try {
          if (user.avatarPath) {
            await deleteObject(ref(storage, user.avatarPath));
          }
          const snap = await uploadBytes(imgRef, img);
          const url = await getDownloadURL(ref(storage, snap.ref.fullPath));

          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            avatar: url,
            avatarPath: snap.ref.fullPath,
          });
          toast.update(id, {
            render: "Photo uploaded successfully!",
            type: "success",
            isLoading: false,
            position: "top-right",
            theme: "colored",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
          });
          setImg("");
        } catch (err) {
          console.log(err.message);
          toast.update(id, {
            render: "Error occurred in uploading photo",
            type: "error",
            isLoading: false,
            position: "top-right",
            theme: "colored",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
          });
        }
      };
      uploadImg();
    }
  }, [img]);

  const deleteImage = async () => {
    try {
      const confirm = window.confirm("Delete avatar?");
      if (confirm) {
        await deleteObject(ref(storage, user.avatarPath));

        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          avatar: "",
          avatarPath: "",
        });
        navigate("/");
      }
    } catch (err) {
      console.log(err.message);
    }
  };
  return user ? (
    <>
      <section style={{ marginTop: "150px" }}>
        <div className="profile_container">
          <div className="img_container">
            <img src={user.avatar || user.photoURL || Img} alt="avatar" />
            <div className="overlay">
              <div>
                <label htmlFor="photo">
                  <Camera />
                </label>
                {user.avatar ? <Delete deleteImage={deleteImage} /> : null}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  id="photo"
                  onChange={(e) => {
                    console.log("event.target.files:", e.target.files[0]);
                    setImg(e.target.files[0]);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="text_container">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <hr />
            <small>Joined on: {user.createdAt.toDate().toDateString()}</small>
          </div>
        </div>
      </section>
      <ToastContainer />
    </>
  ) : null;
};

export default Profile;
