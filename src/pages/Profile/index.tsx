/* eslint-disable prettier/prettier */
import React, { useCallback, useMemo, useRef } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
  PermissionsAndroid,
  Dimensions
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Feather';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';

import Input from '../../components/Input';
import Button from '../../components/Button';

import {
  Container,
  Header,
  HeaderTitle,
  HeaderButton,
  UserAvatarContainer,
  AvatarButtonsContainer,
  UserAvatarButton,
  UserAvatar,
} from './styles';

import getValidationErrors from '../../utils/getValidationErrors';
import api from '../../services/api';
import { useAuth } from '../../hooks/auth';

interface ProfileFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const { user, updateUser, signOut } = useAuth();

  const formRef = useRef<FormHandles>(null);
  const navigation = useNavigation();

  const emailInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const handleProfileUpdate = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('E-mail inválido'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: (val: string) => !!val.length,
            then: Yup.string().required('Campo obrigatório'),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when('old_password', {
              is: (val: string) => !!val.length,
              then: Yup.string().required('Campo obrigatório'),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref('password'), null], 'Confirmação incorreta'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const {
          name,
          email,
          old_password,
          password,
          password_confirmation,
        } = data;

        const formData = {
          name,
          email,
          ...(old_password
            ? {
              old_password,
              password,
              password_confirmation,
            }
            : {}),
        };

        const response = await api.put('/profile', formData);

        updateUser(response.data);

        Alert.alert('Perfil atualizado com sucesso!');

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        Alert.alert(
          'Erro na atualização do perifl',
          'Ocorreu um erro ao atualizar seu perfil, tente novamente',
        );
      }
    },
    [navigation, updateUser],
  );

  const handleUpdateAvatarFromLibrary = useCallback(() => {
    launchImageLibrary({
      mediaType: 'photo',
      // maxWidth: 200,
      // maxHeight: 200,
    }, (response) => {
      if (response.didCancel) return;

      if (response.errorCode) {
        Alert.alert("Erro ao atualizar seu avatar")
        console.log(response.errorMessage);
      }

      const data = new FormData();

      data.append('avatar', {
        type: response.type,
        name: response.fileName,
        uri: response.uri,
      })

      api.patch('users/avatar', data).then((apiResponse) => {
        updateUser(apiResponse.data)
      })

    })
  }, [updateUser])

  const handleUpdateAvatarFromCamera = useCallback(() => {
    launchCamera({
      mediaType: 'photo',
      // maxWidth: 200,
      // maxHeight: 200,
    }, (response) => {
      if (response.didCancel) return;

      if (response.errorCode) {
        Alert.alert("Erro ao atualizar seu avatar")
        console.log("ERROOOOOOO", response.errorMessage);
      }

      const data = new FormData();

      data.append('avatar', {
        type: response.type,
        name: response.fileName,
        uri: response.uri,
      })

      api.patch('users/avatar', data).then((apiResponse) => {
        updateUser(apiResponse.data)
      })

    })
  }, [updateUser])

  const requestCameraPermission = useCallback(async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Permissão para usar a câmera",
          message:
            "GoBarber precisa do acesso à câmera",
          buttonNeutral: "Perguntar outra hora",
          buttonNegative: "Cancelar",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        handleUpdateAvatarFromCamera();
      } else {
        return;
      }
    } catch (err) {
      console.warn(err);
    }
  }, [handleUpdateAvatarFromCamera])

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  const screenHeight = useMemo(() => {
    return Dimensions.get('window').height;
  }, [])

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView
          contentContainerStyle={{ height: screenHeight }}
          keyboardShouldPersistTaps="handled"
        >
          <Container>

            <Header>
              <HeaderButton onPress={handleGoBack}>
                <Icon
                  name="chevron-left"
                  size={24}
                  color="#999591"
                />
              </HeaderButton>

              <HeaderTitle> Meu perfil</HeaderTitle>

              <HeaderButton onPress={handleSignOut}>
                <Icon
                  name="power"
                  size={24}
                  color="#999591"
                />
              </HeaderButton>
            </Header>

            <UserAvatarContainer>
              <UserAvatar source={{ uri: user.avatar_url }} />

              <AvatarButtonsContainer>
                <UserAvatarButton onPress={handleUpdateAvatarFromLibrary}>
                  <Icon
                    name="image"
                    size={24}
                    color="#312E38"
                  />
                </UserAvatarButton>

                <UserAvatarButton onPress={requestCameraPermission}>
                  <Icon
                    name="camera"
                    size={24}
                    color="#312E38"
                  />
                </UserAvatarButton>
              </AvatarButtonsContainer>
            </UserAvatarContainer>


            <Form initialData={user} ref={formRef} onSubmit={handleProfileUpdate}>
              <Input
                autoCapitalize="words"
                name="name"
                icon="user"
                placeholder="Nome"
                returnKeyType="next"
                onSubmitEditing={() => emailInputRef.current?.focus()}
              />
              <Input
                ref={emailInputRef}
                autoCapitalize="none"
                keyboardType="email-address"
                name="email"
                icon="mail"
                placeholder="E-mail"
                returnKeyType="next"
                onSubmitEditing={() => oldPasswordInputRef.current?.focus()}
              />
              <Input
                ref={oldPasswordInputRef}
                secureTextEntry
                name="old_password"
                icon="lock"
                placeholder="Senha atual"
                textContentType="newPassword"
                returnKeyType="next"
                containerStyle={{ marginTop: 16 }}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
              <Input
                ref={passwordInputRef}
                secureTextEntry
                name="password"
                icon="lock"
                placeholder="Nova Senha"
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              />
              <Input
                ref={confirmPasswordInputRef}
                secureTextEntry
                name="password_confirmation"
                icon="lock"
                placeholder="Confirmar Nova Senha"
                textContentType="newPassword"
                returnKeyType="send"
                onSubmitEditing={() => formRef.current?.submitForm()}
              />

              <Button onPress={() => formRef.current?.submitForm()}>
                Confirmar mudanças
              </Button>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
