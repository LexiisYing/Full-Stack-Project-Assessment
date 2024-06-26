import React from "react";
// import "./VideoComponent.css";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CardMedia from "@mui/material/CardMedia";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import SentimentDissatisfiedOutlinedIcon from "@mui/icons-material/SentimentDissatisfiedOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";

const VideoComponent = ({ video, onRemove, onUpvote, onDownvote }) => {
  const { id, title, url, rating } = video;

  const handleRemoveClick = async () => {
    await fetch(`https://musicvideos-app.onrender.com/${id}`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
      },
    });
    onRemove(id);
  };

  const handleVoteClick = async (vote) => {
    const isUpVote = vote === "upVote";

    await fetch(`https://musicvideos-app.onrender.com/${id}`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ isUpVote }),
    });

    if (isUpVote) {
      onUpvote(id);
    } else {
      onDownvote(id);
    }
  };

  return (
    <Container sx={{ py: 5 }} maxWidth="md">
      <Grid container spacing={1}>
        <Grid item key={video.id} xs={12} sm={6} md={4}>
          <Card sx={{ minWidth: 400 }}>
            <CardMedia 
              component="iframe"
              src={url.replace("watch?v=", "embed/")}
              title="YouTube video player"
              sx={{
                // 16:9 aspect ratio
                pt: "0.25%",
                minHeight: 200
              }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ minHeight: 100 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {title}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <FavoriteOutlinedIcon /> {rating}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={handleRemoveClick}>
                <DeleteForeverOutlinedIcon />
              </Button>
              <Button
                size="small"
                onClick={() => {
                  handleVoteClick("upVote");
                }}
              >
                <FavoriteBorderOutlinedIcon />
              </Button>
              <Button
                size="small"
                onClick={() => {
                  handleVoteClick("downVote");
                }}
              >
                <SentimentDissatisfiedOutlinedIcon />
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default VideoComponent;
