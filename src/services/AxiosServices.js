import axios from "axios";

export const ENDPOINT = "";

export const AxiosUtility = axios.create({
  baseURL: `${ENDPOINT}`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = async (instance) => {
  const { data } = await AuthAxiosUtility.post("/login", {
    username: "gakungajacob7@gmail.com",
    password: "Gakunga123$",
  });

  if (data?.access_token) {
    instance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${data?.access_token}`;
  } else {
    delete instance.defaults.headers.common["Authorization"];
  }
};

export default AxiosUtility;
