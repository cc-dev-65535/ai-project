import db from "./db.js";

const API_URL = "https://164.90.154.129:5001/";

const callModel = async ({ input }) => {
  const response = await fetch(API_URL + "api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input }),
  });
  return response;
};

export { callModel };
