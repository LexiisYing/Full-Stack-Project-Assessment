import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VideoComponent.css";

const isValidYouTubeUrl = (url) => {
  // Regular expression to validate YouTube URL
  const youtubeUrlRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
  return youtubeUrlRegex.test(url);
};

const AddVideoForm = ({ onAddVideo }) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [titleError, setTitleError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // clear error
    setTitleError("");
    setUrlError("");

    // Validate title and URL
    if (!title.trim()) {
      setTitleError("Video title is required.");
      return;
    }
    if (!isValidYouTubeUrl(url)) {
      setUrlError("Invalid YouTube URL.");
      return;
    }

    const newVideo = {
      id: Math.floor(Math.random() * 900000) + 100000,
      title: title.trim(),
      url: url.trim(),
      rating: 0,
    };

    await fetch("http://127.0.0.1:5000/", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(newVideo),
    });

    onAddVideo(newVideo);

    // Clear form fields
    setTitle("");
    setUrl("");

    navigate("/");
  };

  const handleAddVideoClick = () => {
    setShowForm(!showForm);
  };

  return (
    <div>
      {showForm ? (
        <form onSubmit={handleSubmit} className="video-form">
          <label>
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label>{titleError}</label>
          </label>
          <label>
            URL:
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <label>{urlError}</label>
          </label>
          <button type="submit">Add Video</button>
        </form>
      ) : (
        <button className="add-video" onClick={handleAddVideoClick}>
          Add video
        </button>
      )}
    </div>
  );
};

export default AddVideoForm;
