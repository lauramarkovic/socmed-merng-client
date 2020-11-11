import React, { useState } from 'react';
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/client";
import { Button, Confirm, Icon } from "semantic-ui-react";

import { FETCH_POSTS_QUERY } from "../util/graphql";
import MyPopup from "../util/MyPopup";

function DeleteButton({ postId, callback, commentId }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const mutation = commentId ? DELETE_COMMENT_MUTATION : DELETE_POST_MUTATION;

  const [deletePostOrMutation] = useMutation(mutation, {
    variables: { postId, commentId },
    update(proxy) {
      setConfirmOpen(false);
      //TODO: remove post from cache
      if(!commentId) {
        const data = proxy.readQuery({
          query: FETCH_POSTS_QUERY
        });
        const deletedPost = data.getPosts.filter((p) => p.id !== postId);
        proxy.writeQuery({
          query: FETCH_POSTS_QUERY,
          data: {
            getPosts: deletedPost
          }
        });
      };
      if(callback) callback();
    },
    onError(err) {
      console.log(err);
    }
  });

  return ( 
    <>
      <MyPopup 
        content={commentId ? "Delete comment" : "Delete post"}
      >
        <Button 
          as="div" 
          color="red" 
          floated="right"
          onClick={() => setConfirmOpen(true)}
        >
          <Icon name="trash" style={{ margin: 0 }}/>
        </Button>
      </MyPopup>
      <Confirm 
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={deletePostOrMutation}
      />
    </>
  )
};

const DELETE_POST_MUTATION = gql`
  mutation deletePost($postId: ID!) {
    deletePost (postId: $postId)
  }
`;

const DELETE_COMMENT_MUTATION = gql`
  mutation deleteComment($postId: ID!, $commentId: ID!) {
    deleteComment(postId: $postId, commentId: $commentId) {
      id commentCount
      comments { 
        id username createdAt body 
      } 
    }
  }
`;

export default DeleteButton;
