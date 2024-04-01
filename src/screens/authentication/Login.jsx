import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Layout } from "@/components";
import {
  LabelledCInput,
  PasswordCInput,
} from "../../components/general/CInput";
import { EmailSvg, LockSvg } from "../../assets/icons";
import { CButton } from "../../components";

const Login = () => {
  const navigation = useNavigation();
  const handleForgotPassword = () => {
    navigation.navigate("auth__recovery_email");
  };

  const handleSignin = () => {
    navigation.navigate("bottom-nav");
  };

  const handleRegister = () => {
    navigation.navigate("auth__registration_email");
  };

  return (
    <Layout ClassName={"px-4 py-4"}>
      <View style={{ gap: 5 }}>
        <LabelledCInput
          label={"Email"}
          icon={<EmailSvg />}
          placeholder={"Enter email address"}
          labelClassName={"text-primary text-13"}
          ClassName={"border border-border_grey px-2"}
          InputClassName={"text-xs px-2 text-gray-600 "}
        />

        <PasswordCInput
          label={"Password"}
          icon={<LockSvg />}
          placeholder={"Enter password"}
          labelClassName={"text-primary text-13"}
          ClassName={"border border-border_grey px-2"}
          InputClassName={"text-xs px-2 text-gray-600 "}
          containerClassName={"mt-4"}
        />
      </View>

      <TouchableOpacity
        className={"flex-row space-x-3 mt-4 justify-end"}
        onPress={handleForgotPassword}
      >
        <Text
          className={"text-xs font-inter text-primary text-right underline"}
        >
          Forgot password?
        </Text>
      </TouchableOpacity>

      {/*    siginin button   */}
      <CButton
        ClassName={
          "bg-primary text-white py-3.5 mb-3 absolute bottom-20 inset-x-0 mx-4"
        }
        onPress={handleSignin}
        textClassName={"text-white font"}
        text={"Sign In"}
      />

      <Text
        className={
          "font-inter text-[13px] absolute bottom-12 inset-x-0 text-center"
        }
        style={{ color: "#888" }}
      >
        Don't have an account?{" "}
        <Text
          className={"font-inter-medium underline text-primary"}
          onPress={handleRegister}
        >
          Sign Up
        </Text>
      </Text>
    </Layout>
  );
};

export default Login;
