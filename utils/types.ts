export interface Profile {
  id: string;
  createdAt: string;
  username: string;
  avatar: string;
}

export interface Message {
  id?: string;
  createdAt?: string;
  content: string;
  userId: string;
  isDeleted: boolean;
  likes: number;
}
