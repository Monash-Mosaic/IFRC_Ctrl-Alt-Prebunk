import { User, UserId } from "@/contents/en";
import AlexAvatar from "../onboarding/_icons/alex-avatar";
import EchoAvatar from "../onboarding/_icons/echo-avatar";
import PaulaAvatar from "../onboarding/_icons/paula-avatar";

export const CHAT_USERS: Record<UserId, User> = {
  user: {
    id: 'user',
    handle: '@user',
    name: 'You',
    avatar: null,
    isUser: true,
  },
  paula: {
    id: 'paula',
    handle: '@paula',
    name: 'Paula',
    avatar: <PaulaAvatar />,
    isUser: false,
  },
  echo: {
    id: 'echo',
    handle: '@echo',
    name: 'Echo',
    avatar: <EchoAvatar />,
    isUser: false,
  },
  alex: {
    id: 'alex',
    handle: '@alex',
    name: 'Alex',
    avatar: <AlexAvatar />,
    isUser: false,
  },
};
