export interface Post {
  id: number;
  title: string;
  body: string;
}
export interface User {
  id: number;
  name: string;
  email: string;
  company: {
    name: string;
  };
}
export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

//type that allows either of the three types above
export type ApiItem = Post | User | Comment;
