import React from "react";

import { CButton, Layout } from "../../../components";
import { LockSvg } from "../../../assets/icons";
import { PasswordCInput } from "../../../components/general/CInput";

const Reset = () => {
  return (
    <Layout ClassName={"px-4"}>
      <PasswordCInput
        label={"New Password"}
        icon={<LockSvg />}
        placeholder={"Enter Password"}
        labelClassName={"text-primary text-13"}
        ClassName={"border border-border_grey px-2"}
        InputClassName={"text-xs px-2 text-gray-600 "}
        containerClassName={"mt-4"}
      />

      <PasswordCInput
        label={"Confirm Password"}
        icon={<LockSvg />}
        placeholder={"Enter Password"}
        labelClassName={"text-primary text-13"}
        ClassName={"border border-border_grey px-2"}
        InputClassName={"text-xs px-2 text-gray-600 "}
        containerClassName={"mt-4"}
      />

      <CButton
        ClassName={
          "bg-primary text-white py-3.5 mb-3 absolute bottom-5 inset-x-0 mx-4"
        }
        // onPress={handleNextStep}
        textClassName={"text-white font"}
        text={"Complete Reset"}
      />
    </Layout>
  );
};

export default Reset;
