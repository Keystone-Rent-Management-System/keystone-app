import React from "react";
import { CButton, Layout } from "../../../components";
import { EmailSvg } from "../../../assets/icons";
import { LabelledCInput } from "../../../components/general/CInput";
import { Text } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Email = () => {
  const navigation = useNavigation();
  const handleNext = () => {
    navigation.navigate("auth__registration_verification");
  };
  return (
    <Layout ClassName={"px-4"}>
      <LabelledCInput
        label={"Email"}
        icon={<EmailSvg />}
        placeholder={"Enter email address"}
        labelClassName={"text-primary text-13"}
        ClassName={"border border-border_grey px-2"}
        InputClassName={"text-xs px-2 text-gray-600 "}
      />

      <Text
        className={
          "text-xs font-inter text-grey_1 my-5 tracking-wide leading-4"
        }
      >
        Creating an account means you agree with the
        <Text className={"text-primary underline"}>
          {" "}
          Privacy Policy
        </Text> and{" "}
        <Text className={"text-primary underline"}>Terms of Service</Text>
      </Text>

      <CButton
        ClassName={
          "bg-primary text-white py-3.5 mb-3 absolute bottom-5 inset-x-0 mx-4"
        }
        onPress={handleNext}
        textClassName={"text-white font"}
        text={"Create Account"}
      />
    </Layout>
  );
};

export default Email;
