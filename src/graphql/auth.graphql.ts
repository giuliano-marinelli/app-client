import { gql } from 'apollo-angular';

export type LoginResult = {
  login: string;
};

export const LOGIN = gql`
  query Login($usernameOrEmail: String!, $password: String!) {
    login(usernameOrEmail: $usernameOrEmail, password: $password)
  }
`;
