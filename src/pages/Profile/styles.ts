import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 32px 24px;
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
`;

export const HeaderTitle = styled.Text`
  font-size: 20px;
  color: #f4ede8;
  font-family: 'RobotoSlab-Medium';
`;

export const HeaderButton = styled.TouchableOpacity``;

export const UserAvatarContainer = styled.View``;

export const UserAvatar = styled.Image`
  width: 186px;
  height: 186px;
  border-radius: 98px;
  align-self: center;
  margin: 32px;
`;

export const AvatarButtonsContainer = styled.View`
  position: absolute;
  margin: auto;
  left: 118px;
  right: 0;
  bottom: 0;
  top: 0;
  justify-content: center;
  align-items: center;
`;

export const UserAvatarButton = styled.TouchableOpacity`
  width: 50px;
  height: 50px;
  background-color: #ff9000;
  border-radius: 25px;
  margin: 40px;
  justify-content: center;
  align-items: center;
`;
