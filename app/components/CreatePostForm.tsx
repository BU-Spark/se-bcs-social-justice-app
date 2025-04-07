import { createPost } from "@/lib/actions/createposts";
import styled from "@emotion/styled";

const FormContainer = styled.div`
  padding: 16px;
  border: 1px solid black;
  border-radius: 8px;
  background-color: silver;
  margin-bottom: 24px;
`;

export default function CreatePostForm({
  communityId,
}: {
  communityId: string;
}) {
  return (
    <FormContainer>
      <form action={createPost}>
        {/* Pass the communityId as a hidden input */}
        <input type="hidden" name="communityId" value={communityId} />
        <input
          type="text"
          name="title"
          placeholder="Enter post title"
          required
        />
        <br />
        <textarea
          name="content"
          placeholder="Write your post content here..."
          rows={4}
          required
        ></textarea>
        <br />
        <button type="submit">Post</button>
      </form>
    </FormContainer>
  );
}
