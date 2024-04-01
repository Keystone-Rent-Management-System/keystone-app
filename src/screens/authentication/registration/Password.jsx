import React from "react";
import { CButton, Layout } from "../../../components";
import { PasswordCInput } from "../../../components/general/CInput";
import { LockSvg } from "../../../assets/icons";
import { useNavigation } from "@react-navigation/native";

const Password = () => {
  const navigation = useNavigation();
  const handleNext = () => {
    navigation.navigate("auth__registration_profile");
  };
  return (
    <Layout ClassName={"px-5"}>
      <PasswordCInput
        label={"New Password"}
        icon={<LockSvg />}
        placeholder={"Enter password"}
        labelClassName={"text-primary text-13"}
        ClassName={"border border-border_grey px-2"}
        InputClassName={"text-xs px-2 text-gray-600 "}
        containerClassName={"mt-4"}
        required
      />

      <PasswordCInput
        label={"Confirm Password"}
        icon={<LockSvg />}
        placeholder={"Confirm password"}
        labelClassName={"text-primary text-13"}
        ClassName={"border border-border_grey px-2"}
        InputClassName={"text-xs px-2 text-gray-600 "}
        containerClassName={"mt-4"}
      />

      <CButton
        ClassName={
          "bg-primary text-white py-3.5 mb-3 absolute bottom-5 inset-x-0 mx-4"
        }
        onPress={handleNext}
        textClassName={"text-white font"}
        text={"Continue"}
      />
    </Layout>
  );
};
export default Password;
