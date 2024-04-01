import React, { useState } from "react";
import { Layout } from "../../../components";
import { LabelledCInput } from "../../../components/general/CInput";
import { FlagSvg, UserSvg } from "../../../assets/icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { ImageSvg } from "../../../assets/icons/auth";
import { launchImageLibrary } from "react-native-image-picker";

const Profile = () => {
  return (
    <Layout ClassName={"p-4"}>
      <View className={"flex-col "} style={{ gap: 15 }}>
        <Uploader />

        <LabelledCInput
          label={"Enter Name"}
          icon={<UserSvg />}
          placeholder={"Enter full name"}
          labelClassName={"text-primary text-13"}
          ClassName={"border border-border_grey px-2"}
          InputClassName={"text-xs px-2 text-gray-600 "}
        />

        <LabelledCInput
          label={"Phone Number"}
          icon={<PrePhone />}
          placeholder={"Enter number"}
          labelClassName={"text-primary text-13"}
          ClassName={"border border-border_grey px-2"}
          InputClassName={"text-xs px-2 text-gray-600 "}
        />
      </View>
    </Layout>
  );
};
export default Profile;

const PrePhone = () => (
  <View className={"flex-row items-center"} style={{ gap: 3 }}>
    <FlagSvg />

    <Text className={"text-neutral-400 font-inter text-xs"}>+254</Text>
  </View>
);

const Uploader = () => {
  const [profileImage, setProfileImage] = useState({});
  const handleUpload = async () => {
    const { assets } = await launchImageLibrary({
      mediaType: "photo",
      quality: 1,
    });

    setProfileImage(assets?.at(0));
  };

  console.log(profileImage);
  return (
    <TouchableOpacity
      className={`flex-row bg-[#7DA3FF10] p-3 border border-neutral-200 rounded-xl`}
      style={{
        gap: 12,
      }}
      onPress={handleUpload}
    >
      {profileImage?.uri ? (
        <Image
          className={"h-14 w-14 rounded-full object-cover"}
          source={{
            uri: profileImage?.uri,
          }}
        />
      ) : (
        <View
          className={
            "h-12 w-12 rounded-full bg-white items-center justify-center border border-neutral-100"
          }
        >
          <ImageSvg />
        </View>
      )}

      <View className={"justify-center"} style={{ gap: 4 }}>
        <Text className={"text-primary font-inter-medium text-sm"}>
          Add profile photo
        </Text>

        <Text className={"text-neutral-500 font-inter text-xs"}>
          upload or take new photo
        </Text>
      </View>

      <TouchableOpacity
        className={"rounded-full border border-neutral-100 px-3 m-auto"}
        onPress={handleUpload}
      >
        <Text className={"text-primary font-inter-medium text-xs"}>Add</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
