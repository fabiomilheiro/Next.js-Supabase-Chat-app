export interface Profile {
  id: string;
  createdAt: string;
  username: string;
}

export interface Message {
  id: string;
  createdAt: string;
  content: string;
  userId: string;
}
