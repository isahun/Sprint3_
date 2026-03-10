// El motlle per als Posts
export interface Post {
  id: number;
  title: string;
  body: string;
}

// El motlle per als Usuaris (fixa't que company és un objecte a dins d'un altre)
export interface User {
  id: number;
  name: string;
  email: string;
  company: {
    name: string;
  };
}

// El motlle per als Comentaris
export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

// Creem un "Super Tipus" que pot ser qualsevol dels tres
export type ApiItem = Post | User | Comment;
